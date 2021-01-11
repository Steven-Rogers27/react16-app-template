import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: {
    }
  },
  'zh_cn': {
    translation: {
      pageTitle: '兼容IE10',
      fileUploader: '文件上传',
      delete: '删除',
      failToUploadFilesDueToNetwork: '文件上传失败：网络原因',
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "zh_cn",

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;