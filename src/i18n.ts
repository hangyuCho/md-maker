interface Messages {
  selectTemplate: string;
  enterOutputPath: string;
  noTemplates: string;
  success: string;
  fileExists: string;
  overwriteConfirm: string;
  fileCreationCancelled: string;
  enterAuthorName: string;
}

const messages: Record<string, Messages> = {
  en: {
    selectTemplate: 'Select a template',
    enterOutputPath: 'Enter the output path (press Enter for current directory)',
    noTemplates: 'No template files found',
    success: '✨ Successfully created',
    fileExists: 'File already exists',
    overwriteConfirm: 'Do you want to overwrite it?',
    fileCreationCancelled: 'File creation cancelled.',
    enterAuthorName: 'Enter author name'
  },
  ko: {
    selectTemplate: '템플릿을 선택하세요',
    enterOutputPath: '저장 경로를 입력하세요 (현재 디렉토리: Enter)',
    noTemplates: '템플릿 파일을 찾을 수 없습니다',
    success: '✨ 성공적으로 생성되었습니다',
    fileExists: '파일이 이미 존재합니다',
    overwriteConfirm: '덮어쓰시겠습니까?',
    fileCreationCancelled: '파일 생성이 취소되었습니다.',
    enterAuthorName: '작성자 이름을 입력하세요'
  },
  ja: {
    selectTemplate: 'テンプレートを選択してください',
    enterOutputPath: '出力パスを入力してください（現在のディレクトリ: Enter）',
    noTemplates: 'テンプレートファイルが見つかりません',
    success: '✨ 正常に作成されました',
    fileExists: 'ファイルは既に存在します',
    overwriteConfirm: '上書きしますか？',
    fileCreationCancelled: 'ファイル作成がキャンセルされました。',
    enterAuthorName: '作成者名を入力してください'
  }
};

function getSystemLanguage(): string {
  const env = process.env;
  const lang = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES;
  if (!lang) return 'en';

  const langCode = lang.split('.')[0].split('_')[0].toLowerCase();
  return messages[langCode] ? langCode : 'en';
}

export function getMessage(key: keyof Messages): string {
  const lang = getSystemLanguage();
  return messages[lang][key];
} 