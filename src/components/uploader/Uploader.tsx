import React, { useRef, useState, } from 'react';
import { useTranslation, } from 'react-i18next';
import clipIcon from '../../assets/images/clip.svg';
import styles from './Uploader.module.css';
import { uploaderApi, } from '../../api/uploader';
import { SUCCEED_CODE, } from '../../constants';
import { message, Icon, } from 'antd';

const arrayProto = Array.prototype;
type UploadFileNameThisRound = {
  name: string;
};

function Uploader() {
  const { t, } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  let fileInput: HTMLInputElement | null;
  const [ addedFileList, setAddedFileList, ] = useState<JSX.Element[]>([]);
  const [ uploading, setUploading, ] = useState<boolean>(false);

  const onUploaderClick = (): void => {
    fileInput = fileInputRef.current;
    fileInput && fileInput.click();
  };

  const onDeleteBtnClick = (id: string): void => {
    setAddedFileList((preElementList: JSX.Element[]): JSX.Element[] => {
      const elementList: JSX.Element[] = [];
      for (let i = 0, len = preElementList.length; i < len; i++) {
        if (preElementList[i].key !== id) {
          elementList.push(preElementList[i]);
        }
      }
      return elementList;
    });
  };

  const addedFileItem = (file: FileUploadResponseDataField, uploadFailed: boolean = false): JSX.Element => (
    <li
      key={file.id}
      data-name={file.name}
      className={styles.addedFileListLi}>
      <span
        className={styles.addedFileItem}
        style={uploadFailed ? { color: '#f5222d', } : undefined}
      >{ file.name }</span>
      <div
        className={styles.deleteBtn}
        onClick={() => onDeleteBtnClick(file.id)}
      >
        <span
          className={styles.deleteBtnText}
        >{ t('delete') }</span>
      </div>
    </li>
  );
  
  const addingFileItem = (file: File): JSX.Element => {
    return (
      <li
        key={file.name}
        data-name={file.name}
        className={styles.addedFileListLi}>
        <Icon
          type="loading"
          className={styles.uploadLoading}
          spin
        />
        <span
          className={styles.addedFileItem}
        >{ file.name }</span>
      </li>
    );
  };

  const updateAddedFileListUI = (
    uploadSucceedData: FileUploadResponseDataField[],
    uploadFailedData: FileUploadResponseDataField[],
  ): void => {
    setAddedFileList((prevElementList: JSX.Element[]): JSX.Element[] => {
      const succeedNameMap = new Map();
      for (let i = 0, len = uploadSucceedData.length; i < len; i++) {
        const file: FileUploadResponseDataField = uploadSucceedData[i];
        succeedNameMap.set(file.name, addedFileItem(file));
      }
      const failedNameMap = new Map();
      for (let i = 0, len = uploadFailedData.length; i < len; i++) {
        const file: FileUploadResponseDataField = uploadFailedData[i];
        failedNameMap.set(file.name, addedFileItem(file, true));
      }
      // 过滤出本轮成功上传的文件节点，并替换其UI状态,
      // 同时要保持之前已经上传成功的节点
      const filteredElement: JSX.Element[] = [];
      for (let i = 0, len = prevElementList.length; i < len; i++) {
        const preEle: JSX.Element = prevElementList[i];
        const name: string = preEle.props['data-name'];
        if (succeedNameMap.has(name)) {
          filteredElement.push(succeedNameMap.get(name));
          continue;
        }
        if (failedNameMap.has(name)) {
          filteredElement.push(failedNameMap.get(name));
          continue;
        }
        filteredElement.push(preEle);
      }
      return filteredElement;
    });
  };

  const uploadFilesApi = (files: File[]): void => {
    if (!files.length) { return; }
    setUploading(true);
    const fileNames: FileUploadResponseDataField[] = arrayProto.map.call(files,
      (file: File): FileUploadResponseDataField => ({
        name: file.name,
        id: file.name,
        url: '',
      })
    ) as FileUploadResponseDataField[];
    uploaderApi.uploadFiles({
      belongId: '',
      type: '',
      files,
    }).then((res: FileUploadResponseType): void => {
      const { status, message: msg, data } = res;
      if (status === SUCCEED_CODE &&
          data
        ) {
        message.success(msg);
        updateAddedFileListUI(data, []);
      } else {
        message.error(msg);
        updateAddedFileListUI([], fileNames);
      }
    }, (): void => {
      message.error(t('failToUploadFilesDueToNetwork'));
      updateAddedFileListUI([], fileNames);
      // updateAddedFileListUI([
      //   {
      //     id: '1234',
      //     name: 'file1',
      //     url: 'www.baidu.com',
      //   },
      //   {
      //     id: '1235',
      //     name: 'file2',
      //     url: 'www.baidu.com',
      //   },
      //   {
      //     id: '1236',
      //     name: 'file3',
      //     url: 'www.baidu.com',
      //   },
      // ]);
    }).finally((): void => {
      setUploading(false);
    });
  };

  const onFileInputChange = (): void => {
    if (fileInput && fileInput.files?.length) {
      const files: FileList = fileInput.files;
      setAddedFileList((prevElementList: JSX.Element[]): JSX.Element[] => {
        const fileNameSet = new Set(
          arrayProto.map.call(prevElementList, (ele: JSX.Element) => ele.props['data-name'])
        );
        const elementList = arrayProto.map.call(files, (file: File) => addingFileItem(file)) as JSX.Element[];
        // 去除之前已经添加过的文件，防止重复添加同一文件
        const deDuplicatedElements: JSX.Element[] = [];
        for (let i = 0, len = elementList.length; i < len; i++) {
          if (!fileNameSet.has(elementList[i].key)) {
            deDuplicatedElements.push(elementList[i]);
          }
        }

        const deDuplicatedFiles: File[] = [];
        for (let i = 0, len = files.length; i < len; i++) {
          if (!fileNameSet.has(files[i].name)) {
            deDuplicatedFiles.push(files[i]);
          }
        }
        uploadFilesApi(deDuplicatedFiles);

        return [...prevElementList, ...deDuplicatedElements];
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
        onChange={onFileInputChange}
      />
      <ul
        className={uploading ? styles.addingFileListUl : styles.addedFileListUl}
      >
        { addedFileList }
      </ul>
    </div>
  );
}

export default Uploader;
