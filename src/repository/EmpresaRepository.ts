import { Empresa } from "../model/Empresa";
import { executarComandoSQL } from "../database/MySql";

export class EmpresaRepository {
    private static instance: EmpresaRepository;
    private constructor() {
    }

    public static getInstance(): EmpresaRepository {
        if (!EmpresaRepository.instance) {
            EmpresaRepository.instance = new EmpresaRepository();
        }
        return EmpresaRepository.instance;
    }

    private rowToEmpresa(row: any): Empresa {
        return new Empresa(row.id_empresa, row.razao_social, row.cnpj);
    }

    async create(empresa: Empresa): Promise<Empresa> {
        const sql = `INSERT INTO empresas (razao_social, cnpj) VALUES (?, ?);`;
        const params = [empresa.razao_social, empresa.cnpj];
        const result = await executarComandoSQL(sql, params);
        const newId = result.insertId;

        const created = await this.findById(newId);
        if (!created) throw new Error("Erro ao criar empresa");
        return created;
    }

    async findById(id: number): Promise<Empresa | null> {
        const sql = "SELECT * FROM empresas WHERE id_empresa = ?;";
        const result = await executarComandoSQL(sql, [id]);
        return result.length > 0 ? this.rowToEmpresa(result[0]) : null;
    }

    async findByRazaoSocial(razao_social: string): Promise<Empresa | null> {
        const sql = "SELECT * FROM empresas WHERE razao_social = ?;";
        const result = await executarComandoSQL(sql, [razao_social]);
        return result.length > 0 ? this.rowToEmpresa(result[0]) : null;
    }

    async findByCnpj(cnpj: string): Promise<Empresa | null> {
        const sql = "SELECT * FROM empresas WHERE cnpj = ?;";
        const result = await executarComandoSQL(sql, [cnpj]);
        return result.length > 0 ? this.rowToEmpresa(result[0]) : null;
    }

    async findAll(): Promise<Empresa[]> {
        const sql = "SELECT * FROM empresas ORDER BY razao_social;";
        const result = await executarComandoSQL(sql, []);
        return result.map((row: any) => this.rowToEmpresa(row));
    }
}