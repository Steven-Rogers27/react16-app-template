import { AxiosResponse } from 'axios';
import { BaseAPI, } from './base';

export class UploaderAPI extends BaseAPI {
  public uploadFiles(data: FileUploadBodyParamsType): Promise<any> {
    const { belongId, type, files, } = data;
    const formData = new FormData();
    formData.append('belongId', belongId);
    formData.append('type', type);
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files[i];
      formData.append('files[]', file, file.name);
    }
    return super.post(
      '/supplier/files',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Glodon-M2-AK': '11a82026a16443ccb71cb18e82409eb4',
          'Glodon-M2-Token': '11a82026a16443ccb71cb18e82409eb4',
        },
      }
    ).then((res: AxiosResponse<FileUploadResponseType>): any => {
      const { data, } = res;
      if (data) {
        return data;
      }
      throw new Error('返回结果data字段不存在');
    }).catch((err: any): any => {
      console.error(err);
      throw err;
    });
  }

  public deleteUploadedFile(id: string): Promise<any> {
    return super.delete(
      `/supplier/files/${id}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Glodon-M2-AK': '11a82026a16443ccb71cb18e82409eb4',
          'Glodon-M2-Token': '11a82026a16443ccb71cb18e82409eb4',
        },
      },
    ).then((res: AxiosResponse<ResponseDataType>): any => {
      const { data, } = res;
      if (data) {
        return data;
      }
      throw new Error('返回结果data字段不存在');
    }).catch((err: any): any => {
      console.error(err);
      throw err;
    });
  }
}

export const uploaderApi = new UploaderAPI();