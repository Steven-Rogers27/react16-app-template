import React, { useRef, useState, } from 'react';
import { useTranslation, } from 'react-i18next';
import clipIcon from '../../assets/images/clip.svg';
import styles from './Uploader.module.css';
import { uploaderApi, } from '../../api/uploader';
import { SUCCEED_CODE, } from '../../constants';
import { message, Icon, } from 'antd';

const arrayProto = Array.prototype;
type AddedFileType = {
  id: string;
  name: string;
  url: string;
  succeed: boolean;
  uploading: boolean;
};

function Uploader() {
  const { t, } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ addedFileList, setAddedFileList, ] = useState<AddedFileType[]>([]);

  const onUploaderClick = (): void => {
    const fileInput: HTMLInputElement | null = fileInputRef.current;
    fileInput && fileInput.click();
  };

  const onDeleteBtnClick = (name: string): void => {
    const fileInput: HTMLInputElement | null = fileInputRef.current;
    setAddedFileList((preFileList: AddedFileType[]): AddedFileType[] => {
      const elementList: AddedFileType[] = [];
      // 删除UI上的文件节点
      for (let i = 0, len = preFileList.length; i < len; i++) {
        const preFile = preFileList[i];
        if (preFile.name !== name) {
          elementList.push(preFile);
        }
      }
      // 从 fileInput.files 中真正删除文件
      // 因为 FileList 是个只读的类数组对象，不能修改，
      // 所以只能清空 value 字段来清除 FileList 中所有文件
      // issue：这种方法在IE10上无效，IE10上清空value，并不会导致清空 FileList
      if (fileInput && fileInput.files?.length) {
        fileInput.value = '';
      }
      return elementList;
    });
  };

  const updateAddedFileListUI = (
    uploadSucceedFile: AddedFileType[],
    uploadFailedFile: AddedFileType[],
  ): void => {
    setAddedFileList((prevFileList: AddedFileType[]): AddedFileType[] => {
      const succeedNameMap = new Map();
      for (let i = 0, len = uploadSucceedFile.length; i < len; i++) {
        const file = uploadSucceedFile[i];
        succeedNameMap.set(file.name, file);
      }
      const failedNameMap = new Map();
      for (let i = 0, len = uploadFailedFile.length; i < len; i++) {
        const file = uploadFailedFile[i];
        failedNameMap.set(file.name, file);
      }
      // 分别改变上传成功、上传失败文件的UI状态
      // 同时保持之前已经上传的文件的UI状态不变
      const nextFileList: AddedFileType[] = [];
      for (let i = 0, len = prevFileList.length; i < len; i++) {
        const preFile: AddedFileType = prevFileList[i];
        const name: string = preFile.name;
        if (succeedNameMap.has(name)) {
          nextFileList.push(succeedNameMap.get(name));
          continue;
        }
        if (failedNameMap.has(name)) {
          nextFileList.push(failedNameMap.get(name));
          continue;
        }
        nextFileList.push(preFile);
      }
      return nextFileList;
    });
  };

  const uploadFilesApi = (files: File[]): void => {
    if (!files.length) { return; }
    const fileNames: AddedFileType[] = arrayProto.map.call(files,
      (file: File): AddedFileType => ({
        id: file.name,
        name: file.name,
        url: '',
        succeed: false,
        uploading: false,
      })
    ) as AddedFileType[];
    uploaderApi.uploadFiles({
      belongId: '',
      type: '',
      files,
    }).then((res: FileUploadResponseType): void => {
      const { status, message: msg, data } = res;
      if (status === SUCCEED_CODE &&
          Array.isArray(data)
        ) {
        message.success(msg);
        updateAddedFileListUI(
          arrayProto.map.call(data, (d: FileUploadResponseDataField): AddedFileType => ({
            id: d.id,
            name: d.name,
            url: d.url,
            succeed: false,
            uploading: false,
          })) as AddedFileType[],
          [],
        );
      } else {
        message.error(msg);
        updateAddedFileListUI([], fileNames);
      }
    }, (): void => {
      message.error(t('failToUploadFilesDueToNetwork'));
      updateAddedFileListUI([], fileNames);
    }).finally((): void => {
    });
  };

  const onFileInputChange = (): void => {
    const fileInput: HTMLInputElement | null = fileInputRef.current;
    if (fileInput && fileInput.files?.length) {
      const files: FileList = fileInput.files;
      setAddedFileList((prevFileList: AddedFileType[]): AddedFileType[] => {
        const prevFileNameSet = new Set(
          arrayProto.map.call(prevFileList, (file: AddedFileType) => file.name)
        );

        // 去除之前已经添加过的文件，防止重复添加同一文件
        const deDuplicatedFiles: File[] = [];
        for (let i = 0, len = files.length; i < len; i++) {
          if (!prevFileNameSet.has(files[i].name)) {
            deDuplicatedFiles.push(files[i]);
          }
        }
        uploadFilesApi(deDuplicatedFiles);

        return [
          ...prevFileList,
          ...arrayProto.map.call(deDuplicatedFiles, (file: File): AddedFileType => ({
            id: file.name,
            name: file.name,
            url: '',
            succeed: false,
            uploading: true,
          })) as AddedFileType[],
        ];
      });
    }
  };

  return (
    <div
      className={styles.uploaderRoot}
    >
      <div
        className={styles.uploaderBox}
        onClick={onUploaderClick}
      >
        <img
          alt=""
          src={clipIcon}
          className={styles.clipIcon}
        />
        <span
          className={styles.fileUploaderText}
        >{ t('fileUploader') }</span>
      </div>
      <input
        ref={fileInputRef}
        accept=""
        multiple
        type="file"
        id="fileUploader"
        className={styles.fileInput}
        onInput={onFileInputChange}
      />
      <ul
        className={styles.addedFileListUl}
      >
        {
          addedFileList.map((file: AddedFileType): JSX.Element => {
            return (
              <li
                key={file.id}
                data-name={file.name}
                className={styles.addedFileListLi}>
                <Icon
                  style={ file.uploading ? { display: 'inline-block', } : { display: 'none', } }
                  type="loading"
                  className={styles.uploadLoading}
                  spin
                />
                <span
                  className={styles.addedFileItem}
                  style={!file.succeed ? { color: '#f5222d', } : undefined}
                >{ file.name }</span>
                <div
                  className={styles.deleteBtn}
                  onClick={() => onDeleteBtnClick(file.name)}
                >
                  <span
                    className={styles.deleteBtnText}
                  >{ t('delete') }</span>
                </div>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
}

export default Uploader;
