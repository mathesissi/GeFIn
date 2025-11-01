import { BalanceteRepository } from '../repository/BalanceteRepository';

export class BalanceteService {
  private repository = BalanceteRepository.getInstance();

  public async getBalancete(mes: number, ano: number) {
    const contas = await this.repository.findByMesEAno(mes, ano);

    const total_debitos = contas.reduce((acc, c) => acc + Number(c.movimento_debito), 0);
    const total_creditos = contas.reduce((acc, c) => acc + Number(c.movimento_credito), 0);

    return {
      mes,
      ano,
      contas: contas.map(c => ({
        codigo_conta: c.codigo_conta,
        nome_conta: c.nome_conta,
        total_debito: Number(c.movimento_debito),
        total_credito: Number(c.movimento_credito),
      })),
      total_debitos,
      total_creditos,
    };
  }
}
