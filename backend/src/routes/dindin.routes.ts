import { Router } from 'express';
import {
  cadastrarSabor,
  apagarSabor,
  calcularTotalSabor,
  listarSabores,
  editarSabor,
  editarQuantidade,
  listarHistoricoPorMes,
  adicionarEntrada,
  adicionarSaida
} from '../controllers/dindin.controller';

const router = Router();

router.post('/novo-sabor', cadastrarSabor);
router.delete('/dindin/:id', apagarSabor);
router.post('/calcular-total', calcularTotalSabor);
router.get('/sabores', listarSabores);
router.put('/editarSabor/:id', editarSabor);
router.patch('/editarQuantidade/:id', editarQuantidade);
router.patch('/adcionar-sentrada/:id', adicionarEntrada);
router.patch('/adcionar-saida/:id', adicionarSaida);
router.get('/historico-por-mes', listarHistoricoPorMes);

export default router;