import { Lancamento } from "../model/Lancamento";
import { executarComandoSQL } from "../database/MySql";


export class LancamentosRepository {
  private static instance: LancamentosRepository;

  private constructor() {
    this.createTable();
  }

  // Adicione este método à classe LancamentosRepository
  public async findLinkedLancamentos(id_conta: number): Promise<any[]> {
    const sql = `
    SELECT id_lancamento, descricao, valor
    FROM lancamentos
    WHERE id_conta_debito = ? OR id_conta_credito = ?;
  `;
    // Repete o ID para verificar os dois campos (débito e crédito)
    const params = [id_conta, id_conta];
    const result = await executarComandoSQL(sql, params);

    // Retorna os dados brutos com as colunas solicitadas
    return result;
  }

  public static getInstance(): LancamentosRepository {
    if (!LancamentosRepository.instance) {
      LancamentosRepository.instance = new LancamentosRepository();
    }
    return LancamentosRepository.instance;
  }

  private async createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS lancamentos (
        id_lancamento INT AUTO_INCREMENT PRIMARY KEY,
        data DATE NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        id_conta_debito INT NOT NULL,
        id_conta_credito INT NOT NULL,
        FOREIGN KEY (id_conta_debito) REFERENCES contas(id_conta),
        FOREIGN KEY (id_conta_credito) REFERENCES contas(id_conta)
      );
    `;
    try {
      await executarComandoSQL(sql, []);
      console.log('Tabela "lancamentos" criada ou já existente.');
    } catch (error) {
      console.error('Erro ao criar tabela "lancamentos":', error);
    }
  }

  private rowToLancamento(row: any): Lancamento {
    const data = row.data instanceof Date ? row.data : new Date(row.data);
    if (isNaN(data.getTime())) {
      throw new Error("Formato de data inválido no banco de dados.");
    }
    return new Lancamento(
      row.id_lancamento,
      data,
      row.descricao,
      row.valor,
      row.id_conta_debito,
      row.id_conta_credito
    );
  }

  public async Create(lancamento: Lancamento): Promise<Lancamento> {
    const sql = `
      INSERT INTO lancamentos (data, descricao, valor, id_conta_debito, id_conta_credito)
      VALUES (?, ?, ?, ?, ?);
    `;
    const params = [
      lancamento.data,
      lancamento.descricao,
      lancamento.valor,
      lancamento.id_conta_debito,
      lancamento.id_conta_credito,
    ];

    const result = await executarComandoSQL(sql, params);
    const newId = result.insertId;

    const createdLancamento = await this.Select(newId);
    if (!createdLancamento) {
      throw new Error("Erro ao criar lançamento.");
    }
    return createdLancamento;
  }

  public async Select(id: number): Promise<Lancamento | null> {
    const sql = "SELECT * FROM lancamentos WHERE id_lancamento = ?;";
    const params = [id];
    const result = await executarComandoSQL(sql, params);
    if (result.length > 0) {
      return this.rowToLancamento(result[0]);
    }
    return null;
  }

  public async findAll(): Promise<Lancamento[]> {
    const sql = "SELECT * FROM lancamentos;";
    const result = await executarComandoSQL(sql, []);
    return result.map((row: any) => this.rowToLancamento(row));
  }

  public async Update(lancamento: Lancamento): Promise<Lancamento | null> {
    const sql = `
      UPDATE lancamentos
      SET data = ?, descricao = ?, valor = ?, id_conta_debito = ?, id_conta_credito = ?
      WHERE id_lancamento = ?;
    `;
    const params = [
      lancamento.data,
      lancamento.descricao,
      lancamento.valor,
      lancamento.id_conta_debito,
      lancamento.id_conta_credito,
      lancamento.id_lancamento,
    ];

    await executarComandoSQL(sql, params);
    return this.Select(lancamento.id_lancamento);
  }

  public async Delete(id: number): Promise<boolean> {
    const sql = "DELETE FROM lancamentos WHERE id_lancamento = ?;";
    const params = [id];

    const result = await executarComandoSQL(sql, params);
    return result.affectedRows > 0;
  }

  public async findByContaAndPeriodo(id_conta: number, mes: number, ano: number): Promise<Lancamento[]> {
    const sql = `
      SELECT * FROM lancamentos
      WHERE (id_conta_debito = ? OR id_conta_credito = ?)
      AND MONTH(data) = ?
      AND YEAR(data) = ?;
    `;
    const params = [id_conta, id_conta, mes, ano];
    const result = await executarComandoSQL(sql, params);
    return result.map((row: any) => this.rowToLancamento(row));
  }
}


//<pre>ValidateError<br> &nbsp; &nbsp;at ExpressTemplateService.getValidatedArgs (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\@tsoa\runtime\dist\routeGeneration\templates\express\expressTemplateService.js:70:19)<br> &nbsp; &nbsp;at C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:87:49<br> &nbsp; &nbsp;at Generator.next (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:8:71<br> &nbsp; &nbsp;at new Promise (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at __awaiter (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:4:12)<br> &nbsp; &nbsp;at LancamentosController_criarLancamento (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\dist\route\routes.js:83:16)<br> &nbsp; &nbsp;at Layer.handleRequest (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\router\lib\layer.js:152:17)<br> &nbsp; &nbsp;at next (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\router\lib\route.js:157:13)<br> &nbsp; &nbsp;at Route.dispatch (C:\Users\mathe\Downloads\IMPORTANTE\GeFin\GeFIn\node_modules\router\lib\route.js:117:3)</pre>