import { useEffect } from 'react';
import { useLang } from './i18n/lang';
import { Glossary } from './pages/Glossary';
import { Home } from './pages/Home';
import { useHashRoute } from './router';
import Calculator from './tools/calculator/Calculator';
import OutsTrainer from './tools/outs/OutsTrainer';
import ReadTheBoard from './tools/read-the-board/ReadTheBoard';
import { APP_NAME, TOOLS } from './tools/registry';

export default function App() {
  const route = useHashRoute();
  const tool = TOOLS.find((t) => t.id === route && t.ready);
  const { lang } = useLang();

  useEffect(() => {
    document.title = tool ? `${tool.text[lang].name} · ${APP_NAME}` : APP_NAME;
  }, [tool, lang]);

  switch (tool?.id) {
    case 'read-the-board':
      return <ReadTheBoard />;
    case 'calculator':
      return <Calculator />;
    case 'outs':
      return <OutsTrainer />;
    case 'glossary':
      return <Glossary />;
    default:
      return <Home />;
  }
}
