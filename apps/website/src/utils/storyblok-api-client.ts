import { apiPlugin, storyblokInit, type SbInitResult } from "@storyblok/js";

export type HolidayProgramWeek = {
  title: string;
  dates: string;
  programs: {
    date: Date;
    slot: "morning" | "afternoon";
    title: string;
    creations: string[];
    image: string;
    color: string;
  }[];
};

class StoryblokClient {
  storyblokApi: NonNullable<SbInitResult["storyblokApi"]>;

  constructor() {
    const { storyblokApi } = storyblokInit({
      accessToken: import.meta.env.STORYBLOK_TOKEN,
      use: [apiPlugin],
      apiOptions: {
        region: "ap",
      },
    });

    if (!storyblokApi) {
      throw new Error("Unable to init storyblok api");
    }

    this.storyblokApi = storyblokApi;
  }

  async getHolidayPrograms({
    status,
  }: {
    status: "draft" | "published";
  }): Promise<HolidayProgramWeek[]> {
    const { data } = await this.storyblokApi.get("cdn/stories", {
      starts_with: "holiday_programs",
      version: status,
    });

    return data.stories.map(({ content }: any) => ({
      title: content.week_title,
      dates: content.week_dates,
      programs: content.Programs.map((program: any) => ({
        date: new Date(program.date.split(" ")[0]),
        slot: program.time_slot,
        title: program.title,
        creations: [
          program.first_creation,
          program.second_creation,
          program.third_creation,
        ],
        image: program.image.filename,
        color: program.color,
      })),
    }));
  }
}

const storyblokClient = new StoryblokClient();

export { storyblokClient };
