import axios from 'axios';
import Configs from './configs';
export default {
    uploadFile: async (payload, onUploadProgress) => {
        const formData = new FormData();
        formData.append('file', payload);
        try {
            const result = await axios.post(Configs.uploadPath, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: progressEvent => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onUploadProgress && onUploadProgress(percentCompleted);
                }
            });
            return result;
        } catch (e) {
            throw e;
        }

    },
}