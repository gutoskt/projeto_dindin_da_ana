type Listener = () => void;

const listeners = new Set<Listener>();

export const assinarAtualizacao = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const avisarDadosAtualizados = () => {
  listeners.forEach((listener) => listener());
};
