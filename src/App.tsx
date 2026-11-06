import { useEffect } from 'react';
import { Dictionary } from './pages/Dictionary';
import { Home } from './pages/Home';
import { useHashRoute } from './router';
import Calculadora from './tools/calculadora/Calculadora';
import LeeLaMesa from './tools/lee-la-mesa/LeeLaMesa';
import OutsTrainer from './tools/outs/OutsTrainer';
import { APP_NAME, TOOLS } from './tools/registry';

export default function App() {
  const route = useHashRoute();
  const tool = TOOLS.find((t) => t.id === route && t.ready);

  useEffect(() => {
    document.title = tool
      ? `${tool.name} · ${APP_NAME}`
      : route === 'diccionario'
        ? `Diccionario · ${APP_NAME}`
        : APP_NAME;
  }, [tool, route]);

  if (route === 'diccionario') return <Dictionary />;

  switch (tool?.id) {
    case 'lee-la-mesa':
      return <LeeLaMesa />;
    case 'calculadora':
      return <Calculadora />;
    case 'outs':
      return <OutsTrainer />;
    default:
      return <Home />;
  }
}
