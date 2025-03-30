import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import * as YAML from 'yaml';
import { getMessage } from '../i18n';
import os from 'os';

interface TemplateField {
  name: string;
  type: 'input' | 'list' | 'checkbox';
  message: string;
  choices?: string[];
  default?: string;
  when?: (answers: any) => boolean;
}

interface Template {
  name: string;
  description: string;
  language: string;
  fields: TemplateField[];
  template: string;
  stepFormat?: string;
}

interface Question {
  type: 'input' | 'list' | 'checkbox';
  name: string;
  message: string;
  choices?: string[];
  default?: string;
  when?: (answers: any) => boolean;
}

interface Config {
  lastPath: string;
  lastId: number;
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

function getConfigPath(): string {
  const configDir = path.join(os.homedir(), '.config', 'h9-cli-md-maker');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  return path.join(configDir, 'config.json');
}

function getConfig(): Config {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return {
        lastPath: config.lastPath || '.',
        lastId: Number(config.lastId) || 0
      };
    } catch (error) {
      return { lastPath: '.', lastId: 0 };
    }
  }
  return { lastPath: '.', lastId: 0 };
}

function saveConfig(config: Config): void {
  const configPath = getConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getNextId(): number {
  const config = getConfig();
  const nextId = config.lastId + 1;
  saveConfig({ ...config, lastId: nextId });
  return nextId;
}

function getLastPath(): string {
  return getConfig().lastPath.trim() || '.';
}

function saveLastPath(path: string): void {
  const config = getConfig();
  saveConfig({ ...config, lastPath: path });
}

function processTemplate(template: Template, answers: Record<string, any>, nextId: number): string {
  let result = template.template;

  // 기본 변수 처리
  result = result.replace(/{{id}}/g, String(nextId));
  result = result.replace(/{{createdAt}}/g, new Date().toISOString());
  result = result.replace(/{{updatedAt}}/g, new Date().toISOString());
  result = result.replace(/{{createdBy}}/g, answers.createdBy || process.env.USER || 'unknown');

  // stepDetails 블록 처리
  if (answers.stepDetails) {
    const steps = answers.stepDetails.split(',').map((step: string) => step.trim());
    const stepContent = steps.map((step: string, index: number) => {
      const [time, water, total, description] = step.split('|').map(s => s.trim());
      let stepFormat = template.stepFormat || `### ${index + 1}단계\n- 시간: {{time}}\n- 물: {{water}}\n- 총량: {{total}}\n- 설명: {{description}}\n`;
      return stepFormat
        .replace(/{{index}}/g, String(index + 1))
        .replace(/{{time}}/g, time || 'N/A')
        .replace(/{{water}}/g, water || 'N/A')
        .replace(/{{total}}/g, total || 'N/A')
        .replace(/{{description}}/g, description || step);
    }).join('\n');
    result = result.replace(/\{\{#stepDetails\}\}\s*\{\{\/stepDetails\}\}/g, stepContent);
  }

  // Handle custom dripper
  if (answers.dripper === 'Other' && answers.customDripper) {
    result = result.replace(/\{\{dripper\}\}/g, answers.customDripper);
  } else {
    result = result.replace(/\{\{dripper\}\}/g, answers.dripper);
  }

  // Handle custom grinder
  if (answers.grinder === 'Other' && answers.customGrinder) {
    result = result.replace(/\{\{grinder\}\}/g, answers.customGrinder);
  } else {
    result = result.replace(/\{\{grinder\}\}/g, answers.grinder);
  }

  // 나머지 변수 처리
  Object.keys(answers).forEach(key => {
    if (key !== 'stepDetails' && key !== 'createdBy' && key !== 'dripper' && key !== 'customDripper' && key !== 'grinder') {
      const value = answers[key];
      if (value !== undefined && value !== null) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      }
    }
  });

  return result;
}

function getLanguageFromFilename(filename: string): string {
  const match = filename.match(/md-format-.*-([a-z]{2})\.yml$/);
  return match ? match[1] : 'en';
}

export async function create(): Promise<void> {
  try {
    // 프로젝트 루트 디렉토리에서 md-format-*.yml 파일들을 찾습니다
    const formatFiles = fs.readdirSync(process.cwd())
      .filter(file => file.startsWith('md-format-') && file.endsWith('.yml'));

    if (formatFiles.length === 0) {
      console.error(chalk.red(getMessage('noTemplates')));
      // console.log(chalk.yellow('현재 디렉토리:', process.cwd()));
      // console.log(chalk.yellow('사용 가능한 파일들:', fs.readdirSync(process.cwd()).join(', ')));
      throw new Error(getMessage('noTemplates'));
    }

    // 템플릿 선택
    const { selectedTemplate } = await inquirer.prompt<{ selectedTemplate: string }>([
      {
        type: 'list',
        name: 'selectedTemplate',
        message: getMessage('selectTemplate'),
        choices: formatFiles.map(file => ({
          name: `${file.replace('md-format-', '').replace('.yml', '')} (${getLanguageFromFilename(file)})`,
          value: file
        }))
      }
    ]);

    // console.log(chalk.blue('선택된 템플릿:', selectedTemplate));

    // 선택된 템플릿 파일 읽기
    const templateContent = fs.readFileSync(selectedTemplate, 'utf-8');
    const template: Template = YAML.parse(templateContent);

    // console.log(chalk.blue('템플릿 정보:', JSON.stringify(template, null, 2)));

    // 템플릿 필드에 대한 사용자 입력 받기
    const answers = await inquirer.prompt([
      ...template.fields,
      {
        type: 'input',
        name: 'createdBy',
        message: getMessage('enterAuthorName'),
        default: process.env.USER || 'unknown'
      }
    ]);

    // console.log(chalk.blue('사용자 입력:', JSON.stringify(answers, null, 2)));

    // 템플릿 문자열에 사용자 입력 적용
    const nextId = getNextId();
    const result = processTemplate(template, answers, nextId);

    // 저장 경로 입력 받기
    const { outputPath } = await inquirer.prompt<{ outputPath: string }>([
      {
        type: 'input',
        name: 'outputPath',
        message: getMessage('enterOutputPath'),
        default: getLastPath()
      }
    ]);

    // console.log(chalk.blue('저장 경로:', outputPath));

    // 저장 경로가 존재하는지 확인하고 없으면 생성
    const absolutePath = path.resolve(process.cwd(), outputPath);
    ensureDirectoryExists(absolutePath);

    // console.log(chalk.blue('절대 경로:', absolutePath));

    // 마지막 사용 경로 저장
    saveLastPath(outputPath);

    // 결과 파일 저장 (id만 포함)
    const outputFile = path.join(absolutePath, `${template.name.toLowerCase().replace(/\s+/g, '')}-${nextId}.md`);
    
    // console.log(chalk.blue('생성할 파일 경로:', outputFile));
    // console.log(chalk.blue('파일 내용:', result));
    
    // 파일이 이미 존재하는 경우 덮어쓰기 여부 확인
    if (fs.existsSync(outputFile)) {
      const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `${getMessage('fileExists')}: ${outputFile}\n${getMessage('overwriteConfirm')}`,
          default: false
        }
      ]);

      if (!overwrite) {
        console.log(chalk.yellow(getMessage('fileCreationCancelled')));
        return;
      }
    }
    
    fs.writeFileSync(outputFile, result);

    console.log(chalk.green(`\n${getMessage('success')} ${outputFile}!`));
  } catch (error) {
    console.error(chalk.red('error:'), error);
    throw error;
  }
} 