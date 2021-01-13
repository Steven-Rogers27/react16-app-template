import React, { useRef, useState, } from 'react';
import PropTypes from 'prop-types';
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
  deleting: boolean;
};

type DeletingFileType = {
  name: Set<string>;
};

type UploaderProps = {
  belongId: string;
  type: string;
};

const deletingFile: DeletingFileType = {
  name: new Set<string>(),
};

function Uploader(props: UploaderProps) {
  const { t, } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ addedFileList, setAddedFileList, ] = useState<AddedFileType[]>([]);
  /**
   * 点击“上传附件”按钮时触发的回调，唤起添加文件的弹框
   */
  const onUploaderClick = (): void => {
    const fileInput: HTMLInputElement | null = fileInputRef.current;
    fileInput && fileInput.click();
  };
  /**
   * 删除文件成功后，从UI上删除文件节点，同时也要从FileList对象中删除
   * 
   * @param {string} name - 将要删除的文件名称 
   */
  const updateDeletedFileListUI = (name: string): void => {
    setAddedFileList((preFileList: AddedFileType[]): AddedFileType[] => {
      const nextFileList: AddedFileType[] = [];
      // 删除UI上的文件节点
      for (let i = 0, len = preFileList.length; i < len; i++) {
        const preFile = preFileList[i];
        if (preFile.name !== name) {
          nextFileList.push(preFile);
        }
      }
      // 从 fileInput.files 中真正删除文件
      // 因为 FileList 是个只读的类数组对象，不能修改，
      // 所以只能清空 value 字段来清除 FileList 中所有文件
      // issue：这种方法在IE10上无效，IE10上清空value，并不会导致清空 FileList
      const fileInput: HTMLInputElement | null = fileInputRef.current;
      if (fileInput) {
        fileInput.value = '';
      }
      return nextFileList;
    });
  };
  /**
   * 修改正在删除的文件的“删除”按钮的deleting状态，
   * deleting状态是为了避免在一个删除请求返回前，再次重复调用该请求
   * 
   * @param {string} name - 要删除的文件名称
   * @param {boolean} deleting - true: 正在删除，false: 删除结束 
   */
  const updateFileDeleteStatus = (name: string, deleting: boolean): void => {
    setAddedFileList((preFileList: AddedFileType[]): AddedFileType[] => {
      const nextFileList: AddedFileType[] = [];
      for (let i = 0, len = preFileList.length; i < len; i++) {
        const preFile = preFileList[i];
        if (preFile.name === name) {
          nextFileList.push({
            ...preFile,
            deleting,
          });
        } else {
          nextFileList.push(preFile);
        }
      }
      return nextFileList;
    });
  };
  /**
   * 调用删除文件的接口，同时要防止一个请求在尚未返回前被反复多次调用
   * 
   * @param {Object} file - 要删除的文件信息对象
   */
  const deleteUploadedFile = (file: AddedFileType): void => {
    const { id, name, } = file;
    if (deletingFile.name.has(name)) {
      return;
    }
    deletingFile.name.add(name);
    updateFileDeleteStatus(name, true);
    uploaderApi.deleteUploadedFile(id)
                .then((res: ResponseDataType): void => {
                  const { status, message: msg, } = res;
                  if (status === SUCCEED_CODE) {
                    message.success(msg);
                    updateDeletedFileListUI(name);
                  } else {
                    message.error(msg);
                    updateFileDeleteStatus(name, false);
                  }
                }, (): void => {
                  updateFileDeleteStatus(name, false);
                  message.error(t('failToDeleteFileDueToNetwork'));
                }).finally((): void => {
                  deletingFile.name.delete(name);
                });
  };
  /**
   * 当点击文件名后面的“删除”按钮时触发的回调，
   * 需要判断文件是否上传成功：
   * 1. 上传成功时，需要调用删除文件接口，并当接口返回成功时再从UI上删除文件节点
   * 2. 上传失败时，直接从UI上删除文件节点
   * 
   * @param {Object} file - 要删除的文件信息对象 
   */
  const onDeleteBtnClick = (file: AddedFileType): void => {
    const { name, succeed, } = file;
    // 上传成功的文件需要调接口删除
    // 上传失败的文件直接从UI删除
    if (succeed) {
      deleteUploadedFile(file);
    } else {
      updateDeletedFileListUI(name);
    }
  };
  /**
   * 上传文件接口返回后，执行该方法来更新已选文件节点的UI显示，
   * 上传成功和上传失败的文件的UI状态不同，需要分别处理
   * 
   * @param {Object[]} uploadSucceedFile - 上传成功的文件信息对象数组 
   * @param {Object[]} uploadFailedFile - 上传失败的文件信息对象数组
   */
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
  /**
   * 调用上传文件接口，
   * 这里的特殊之处是，批量上传的文件的成功与否是一致的，全部成功或全部失败
   * 
   * @param {Object[]} files - 将要上传的文件对象数组 
   */
  const uploadFilesApi = (files: File[]): void => {
    if (!files.length) { return; }
    // 因为该接口是全部成功/失败，所以预先准备好失败情况时的文件状态对象
    const failedFileNames: AddedFileType[] = arrayProto.map.call(files,
      (file: File): AddedFileType => ({
        id: file.name,
        name: file.name,
        url: '',
        succeed: false,
        uploading: false,
        deleting: false,
      })
    ) as AddedFileType[];

    uploaderApi.uploadFiles({
      belongId: props.belongId,
      type: props.type,
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
            deleting: false,
          })) as AddedFileType[],
          [],
        );
      } else {
        message.error(msg);
        updateAddedFileListUI([], failedFileNames);
      }
    }, (): void => {
      message.error(t('failToUploadFilesDueToNetwork'));
      updateAddedFileListUI([], failedFileNames);
    }).finally((): void => {
    });
  };
  /**
   * 当 inputFile 节点的 click 事件触发时的响应回调，唤起选择文件的弹框，
   * 预先在UI上渲染出正在上传的文件节点
   */
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
            deleting: false,
          })) as AddedFileType[],
        ];
      });
    }
  };
  /**
   * 已经成功上传的文件，点击文件名时可下载该文件
   * 
   * @param {string} url - 下载文件的地址 
   */
  const onFileNameClick = (url: string): void => {
    if (url) {
      window.location.href = url;
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
                className={styles.addedFileListLi}>
                <Icon
                  style={ file.uploading ? { display: 'inline-block', } : { display: 'none', } }
                  type="loading"
                  className={styles.uploadLoading}
                  spin
                />
                <span
                  className={styles.addedFileItem}
                  style={!file.succeed ? { color: '#f5222d', } : { cursor: 'pointer', }}
                  onClick={() => onFileNameClick(file.url)}
                >{ file.name }</span>
                <div
                  style={ file.uploading ? { display: 'none', } : { display: 'inline-block', } }
                  className={styles.deleteBtn}
                  onClick={() => onDeleteBtnClick(file)}
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

Uploader.propTypes = {
  belongId: PropTypes.string,
  type: PropTypes.oneOf([
    'SIGN_UP',
    'NOTICE_AQ',
    'DOC_AQ',
    'BID',
  ]),
};

export default Uploader;
