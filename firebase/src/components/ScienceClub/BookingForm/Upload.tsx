import React, { useContext, useState } from 'react'
import { Button, message, Progress, Upload as AntdUpload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { RcFile, UploadFile } from 'antd/es/upload/interface'
import type { UploadRequestOption } from 'rc-upload/lib/interface'
import Firebase, { FirebaseContext } from '../../Firebase'
import firebase from 'firebase/compat'

type Props = {
    onSuccess: (filename: string) => void
}
const Upload: React.FC<Props> = ({ onSuccess }) => {
    const firebase = useContext(FirebaseContext) as Firebase

    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [progress, setProgress] = useState(100)
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const beforeUpload = (file: RcFile) => {
        const isPdf = file.type === 'application/pdf'
        if (!isPdf) {
            message.error('The anaphylaxis plan must be a PDF document.')
        }
        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isLt5M) {
            message.error('Document must be smaller than 5MB.')
        }
        return isPdf && isLt5M
    }

    const onRemove = async (file: UploadFile) => {
        setDeleting(true)
        const storageRef = firebase.storage.ref().child(`anaphylaxisPlans/${file.name}`)
        try {
            await storageRef.delete()
            setFileList([])
            setDeleting(false)
            onSuccess('')
        } catch (err) {
            message.error('Error removing file')
            setDeleting(false)
        }
    }

    const upload = (upload: UploadRequestOption) => {
        const file = upload.file as UploadFile
        setUploading(true)
        const path = `anaphylaxisPlans/${file.name}`
        const storageRef = firebase.storage.ref().child(path)
        const uploadTask = storageRef.put(file as unknown as Blob, { contentType: 'application/pdf' })
        uploadTask.on(
            'state_changed',
            (snapshot: firebase.storage.UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setProgress(Math.round(progress))
            },
            (error: Error) => {
                console.error('error', error)
                setUploading(false)
                message.error('Error occured during upload')
            },
            () => {
                setFileList([{ uid: file.uid, name: file.name }])
                setUploading(false)
                onSuccess(file.name)
            }
        )
    }

    return (
        <>
            <AntdUpload
                showUploadList
                multiple={false}
                maxCount={1}
                fileList={fileList}
                beforeUpload={beforeUpload}
                customRequest={upload}
                onRemove={onRemove}
            >
                <Button icon={<UploadOutlined />} loading={deleting || uploading}>
                    Press to Upload
                </Button>
            </AntdUpload>
            {uploading && <Progress percent={progress} />}
        </>
    )
}

export default Upload
