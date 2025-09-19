/*    import mysql, { Connection } from 'mysql2';
import { ContaRepository } from '../repository/ContasRepository';
import { BalanceteRepository } from '../repository/BalanceteRepository';
import { LancamentosRepository } from '../repository/LancamentosRepository';

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'gefin'
};

export let mysqlConnection: mysql.Connection;

export async function inicializarBancoDeDados() {
    const initialConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
    });
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await initialConnection.end();

    mysqlConnection = await mysql.createConnection(dbConfig);
    console.log('Conexão bem-sucedida com o banco de dados MySQL');

    const repositories = [
        new ContaRepository(mysqlConnection),        
        new BalanceteRepository(),  
        new LancamentosRepository(),
    ];

    // 4. Itera sobre os repositórios e cria a tabela para cada um
    for (const repository of repositories) {
        if (typeof repository.createTable === 'function') {
            await repository.createTable();
        }
    }
    console.log('Tabelas do banco de dados verificadas/criadas com sucesso.');
}


export function executarComandoSQL(query: string, valores: any[] = []): Promise<any> {
    if (!mysqlConnection) {
        throw new Error('A conexão com o MySQL não foi inicializada.');
    }
    return mysqlConnection.query(query, valores);
}
*/


//teste de nova maneira de conectar banco de dados - em vez de criar as tabelas em cada repository, cria direto por aqui, e vamos apenas enviando inserts>> 
import mysql, { Connection, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';


const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'GeFinServer',
    database: 'sgb'
};


const mysqlConnection: Connection = mysql.createConnection(dbConfig);

mysqlConnection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
    console.log('Conexão bem-sucedida com o banco de dados MySQL');
});

/**
 * Executa um comando SQL de forma assíncrona.
 * Essa função é a única interface que a sua aplicação usa para se comunicar com o banco de dados.
 * * @param query A string da consulta SQL (usando '?' para placeholders).
 * @param valores Um array de valores para substituir os placeholders na consulta.
 * @returns Uma Promise com o resultado da consulta.
 */
export function executarComandoSQL(query: string, valores: any[] = []): Promise<any> {
    return new Promise<any>(
        (resolve, reject) => {
            // O tipo 'OkPacket' é para operações de escrita (INSERT, UPDATE, DELETE)
            // O tipo 'RowDataPacket[]' é para operações de leitura (SELECT)
            mysqlConnection.query(query, valores, (err, resultado: OkPacket | RowDataPacket[] | ResultSetHeader) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(resultado);
            });
        }
    );
}


export async function criarTabelas() {
    console.log('\nVerificando e criando tabelas...');

    await executarComandoSQL(`
        CREATE TABLE IF NOT EXISTS contas (
            id_conta INT AUTO_INCREMENT PRIMARY KEY,
            nome_conta VARCHAR(100) NOT NULL,
            tipo_conta VARCHAR(50) NOT NULL,
            codigo_conta VARCHAR(20) UNIQUE
        );
    `, []);

    await executarComandoSQL(`
        CREATE TABLE IF NOT EXISTS balancetes (
            id_balancete INT AUTO_INCREMENT PRIMARY KEY,
            mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
            ano INT NOT NULL
        );
    `, []);

    await executarComandoSQL(`
        CREATE TABLE IF NOT EXISTS lancamentos (
            id_lancamento INT AUTO_INCREMENT PRIMARY KEY,
            data DATE NOT NULL,
            descricao TEXT,
            valor NUMERIC(12,2) NOT NULL,
            id_conta_debito INT NOT NULL REFERENCES contas(id_conta),
            id_conta_credito INT NOT NULL REFERENCES contas(id_conta)
        );
    `, []);

    console.log('Tabelas verificadas e/ou criadas com sucesso.');
}