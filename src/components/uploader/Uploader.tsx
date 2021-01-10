import React, { useRef, useState, } from 'react';
import { useTranslation, } from 'react-i18next';
import clipIcon from '../../assets/images/clip.svg';
import styles from './Uploader.module.css';

const arrayProto = Array.prototype;

function Uploader() {
  const { t, } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  let fileInput: HTMLInputElement | null;
  const [ addedFileList, setAddedFileList, ] = useState<JSX.Element[]>([]);

  const onUploaderClick = (): void => {
    fileInput = fileInputRef.current;
    fileInput && fileInput.click();
  };

  const onFileInputChange = (): void => {
    if (fileInput && fileInput.files?.length) {
      const files: FileList = fileInput.files;
      const elmentList = arrayProto.map.call(files, (file: File, index: number) => (
        <li key={file.name}>{ file.name }</li>
      )) as JSX.Element[];
      setAddedFileList((prevElementList: JSX.Element[]): JSX.Element[] => {
        const fileNameSet = new Set();
        for (let i = 0, len = prevElementList.length; i < len; i++) {
          fileNameSet.add(prevElementList[i].key);
        }
        // 去除之前已经添加过的文件，防止重复添加同一文件
        const deDuplicatedList: JSX.Element[] = [];
        for (let i = 0, len = elmentList.length; i < len; i++) {
          if (!fileNameSet.has(elmentList[i].key)) {
            deDuplicatedList.push(elmentList[i]);
          }
        }
        return [...prevElementList, ...deDuplicatedList];
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
        className={styles.addedFileListUl}
      >
        { addedFileList }
      </ul>
    </div>
  );
}

export default Uploader;