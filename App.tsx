
import React, { useState, useCallback } from 'react';
import { analyzeText, findStoryIdeas, writeNewsArticle } from './services/geminiService';
import { EditorIcon, IdeaIcon, WriteIcon, LoaderIcon, ErrorIcon, SparklesIcon } from './components/icons';
import { MarkdownRenderer } from './components/MarkdownRenderer';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = useCallback(async (action: 'analyze' | 'find_ideas' | 'write_news') => {
    if (isLoading) return;
    if (action !== 'find_ideas' && !inputText.trim()) {
      setError('Пожалуйста, введите текст для обработки.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      let result: string | null = '';
      switch (action) {
        case 'analyze':
          result = await analyzeText(inputText);
          break;
        case 'find_ideas':
          result = await findStoryIdeas(inputText);
          break;
        case 'write_news':
          result = await writeNewsArticle(inputText);
          break;
      }
      setOutputText(result ?? 'Не удалось получить ответ.');
    } catch (e) {
      console.error(e);
      setError('Произошла ошибка при обращении к API. Пожалуйста, проверьте API ключ и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <ActionButton
            onClick={() => handleAction('analyze')}
            icon={<EditorIcon />}
            label="Я редактор"
            description="Анализ и отчет"
            disabled={isLoading}
          />
          <ActionButton
            onClick={() => handleAction('find_ideas')}
            icon={<IdeaIcon />}
            label="Нет идеи"
            description="Поиск тем"
            disabled={isLoading}
          />
          <ActionButton
            onClick={() => handleAction('write_news')}
            icon={<WriteIcon />}
            label="Есть повод"
            description="Написание текста"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[65vh]">
          <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите или вставьте ваш текст здесь..."
              className="w-full flex-grow p-4 bg-transparent resize-none focus:outline-none text-base leading-relaxed"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 overflow-y-auto">
            {isLoading && <LoadingState />}
            {!isLoading && error && <ErrorState message={error} />}
            {!isLoading && !error && !outputText && <InitialState />}
            {!isLoading && !error && outputText && (
              <div className="p-4">
                 <MarkdownRenderer content={outputText} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  disabled: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, label, description, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full sm:w-auto flex-grow flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all duration-200 ease-in-out bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white"
  >
    {icon}
    <div className="text-left">
      <span className="text-base text-slate-900">{label}</span>
      <p className="text-sm text-slate-500 font-normal">{description}</p>
    </div>
  </button>
);

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 p-8 text-center">
    <LoaderIcon />
    <p className="font-semibold text-lg">Обработка...</p>
    <p className="text-sm">Искусственный интеллект анализирует ваш запрос.</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-red-600 gap-4 p-8 text-center">
    <ErrorIcon />
    <p className="font-semibold text-lg">Ошибка</p>
    <p className="text-sm">{message}</p>
  </div>
);

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 p-8 text-center">
    <SparklesIcon />
    <p className="font-semibold text-lg">Результат появится здесь</p>
    <p className="text-sm">Введите текст слева и выберите действие, чтобы начать работу.</p>
  </div>
);

export default App;
