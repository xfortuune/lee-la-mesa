import { useEffect } from 'react';
import { Dictionary } from './pages/Dictionary';
import { Home } from './pages/Home';
import { useHashRoute } from './router';
import Calculadora from './tools/calculadora/Calculadora';
import LeeLaMesa from './tools/lee-la-mesa/LeeLaMesa';
import OutsTrainer from './tools/outs/OutsTrainer';
import { useLang } from './i18n/lang';
import { APP_NAME, TOOLS } from './tools/registry';

export default function App() {
  const route = useHashRoute();
  const tool = TOOLS.find((t) => t.id === route && t.ready);
  const { lang } = useLang();

  useEffect(() => {
    document.title = tool ? `${tool.text[lang].name} · ${APP_NAME}` : APP_NAME;
  }, [tool, lang]);

  switch (tool?.id) {
    case 'lee-la-mesa':
      return <LeeLaMesa />;
    case 'calculadora':
      return <Calculadora />;
    case 'outs':
      return <OutsTrainer />;
    case 'diccionario':
      return <Dictionary />;
    default:
      return <Home />;
  }
}
