declare interface ResponseDataType {
  status: number | string;
  message?: string;
  data?: any;
}

declare interface FileUploadResponseDataField {
  id: string;
  name: string;
  url: string;
}

declare interface FileUploadResponseType extends ResponseDataType {
  data?: FileUploadResponseDataField[];  
}