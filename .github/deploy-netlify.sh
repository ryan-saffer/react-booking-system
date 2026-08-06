#!/usr/bin/env bash

set -euo pipefail

for variable in GITHUB_REF_NAME GITHUB_RUN_ATTEMPT GITHUB_RUN_ID GITHUB_SHA GITHUB_STEP_SUMMARY NETLIFY_AUTH_TOKEN NETLIFY_BUILD_HOOK_URL NETLIFY_SITE_ID; do
    if [ -z "${!variable:-}" ]; then
        echo "Missing required environment variable: $variable" >&2
        exit 1
    fi
done

api_url='https://api.netlify.com/api/v1'
deploy_title="GitHub-Actions-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}-${GITHUB_SHA}"
hook_separator='?'
if [[ "$NETLIFY_BUILD_HOOK_URL" == *'?'* ]]; then
    hook_separator='&'
fi

hook_response="$(curl --fail-with-body --silent --show-error \
    --header 'Content-Type: application/json' \
    --request POST \
    --data '{}' \
    "${NETLIFY_BUILD_HOOK_URL}${hook_separator}trigger_title=${deploy_title}")"

deploy_id="$(printf '%s' "$hook_response" | jq -r '.deploy_id // empty' 2>/dev/null || true)"
build_link_announced='false'
echo 'Triggered Netlify build; waiting for its deploy record...'

netlify_api() {
    curl --fail-with-body --silent --show-error \
        --header "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
        "$1"
}

for _ in $(seq 1 180); do
    if [ -z "$deploy_id" ]; then
        deploys_json="$(netlify_api "$api_url/sites/$NETLIFY_SITE_ID/deploys?per_page=100")"
        deploy_id="$(printf '%s' "$deploys_json" | jq -r --arg title "$deploy_title" 'map(select(.title == $title)) | first | .id // empty')"
    fi

    if [ -n "$deploy_id" ]; then
        deploy_json="$(netlify_api "$api_url/deploys/$deploy_id")"
        if [ "$build_link_announced" = 'false' ]; then
            admin_url="$(printf '%s' "$deploy_json" | jq -r '.admin_url // empty')"
            if [ -n "$admin_url" ]; then
                printf 'Netlify build logs: %s\n' "$admin_url"
                printf '::notice title=Netlify build::%s\n' "$admin_url"
                printf '### Netlify build\n\n[Follow the build on Netlify](%s)\n' "$admin_url" >> "$GITHUB_STEP_SUMMARY"
                build_link_announced='true'
            fi
        fi
        commit_ref="$(printf '%s' "$deploy_json" | jq -r '.commit_ref // empty')"
        skipped="$(printf '%s' "$deploy_json" | jq -r '.skipped // false')"
        state="$(printf '%s' "$deploy_json" | jq -r '.state // empty')"

        if [ "$skipped" = 'true' ]; then
            echo "Netlify skipped deploy $deploy_id" >&2
            exit 1
        fi

        if [ -n "$commit_ref" ] && [ "$commit_ref" != "$GITHUB_SHA" ]; then
            curl --fail-with-body --silent --show-error \
                --header "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
                --request POST \
                "$api_url/deploys/$deploy_id/cancel" >/dev/null || true
            echo "Netlify selected commit $commit_ref instead of $GITHUB_SHA; canceled deploy $deploy_id" >&2
            exit 1
        fi

        case "$state" in
            ready | current)
                if [ "$commit_ref" != "$GITHUB_SHA" ]; then
                    echo "Netlify deploy $deploy_id became ready without the expected commit $GITHUB_SHA" >&2
                    exit 1
                fi
                deploy_url="$(printf '%s' "$deploy_json" | jq -r '.deploy_ssl_url // .deploy_url')"
                published_url="$(printf '%s' "$deploy_json" | jq -r '.ssl_url // .url')"
                if [ "$GITHUB_REF_NAME" = 'main' ]; then
                    heading='Website production deploy'
                else
                    heading='Website development branch deploy'
                fi
                printf '%s ready: %s\n' "$heading" "$deploy_url"
                printf '### %s\n\n- [Immutable deploy](%s)\n- [Published URL](%s)\n' \
                    "$heading" "$deploy_url" "$published_url" >> "$GITHUB_STEP_SUMMARY"
                exit 0
                ;;
            error | canceled | cancelled)
                error_message="$(printf '%s' "$deploy_json" | jq -r '.error_message // empty')"
                echo "Netlify deploy $deploy_id ended in state '$state': $error_message" >&2
                exit 1
                ;;
        esac
    fi

    sleep 5
done

echo 'Timed out waiting for Netlify deployment' >&2
exit 1
