/**
 * Parser para linha digitável e código de barras de boletos bancários brasileiros
 * Baseado no padrão FEBRABAN
 */

export interface BoletoData {
  linhaDigitavel: string;
  codigoBarras: string;
  banco: string;
  bancoNome?: string;
  valor: number;
  vencimento: Date;
  nossoNumero?: string;
  agencia?: string;
  conta?: string;
}

const BANCOS: Record<string, string> = {
  "001": "Banco do Brasil",
  "033": "Santander",
  "104": "Caixa Econômica Federal",
  "237": "Bradesco",
  "341": "Itaú",
  "356": "Banco Real",
  "389": "Banco Mercantil do Brasil",
  "399": "HSBC",
  "422": "Banco Safra",
  "453": "Banco Rural",
  "633": "Banco Rendimento",
  "652": "Itaú Unibanco",
  "745": "Citibank",
};

/**
 * Converte linha digitável em código de barras
 */
function linhaDigitavelToCodigoBarras(linha: string): string {
  // Remove espaços e pontos
  linha = linha.replace(/[.\s]/g, "");

  if (linha.length !== 47) {
    throw new Error("Linha digitável deve ter 47 dígitos");
  }

  // Extrai os campos da linha digitável
  const campo1 = linha.substring(0, 10);
  const campo2 = linha.substring(10, 21);
  const campo3 = linha.substring(21, 32);
  const campo4 = linha.substring(32, 33); // DV geral
  const campo5 = linha.substring(33, 47); // Fator vencimento + valor

  // Reconstrói o código de barras (44 dígitos)
  const codigoBarras =
    campo1.substring(0, 4) + // Banco + moeda
    campo4 + // DV geral
    campo5 + // Fator vencimento + valor
    campo1.substring(4, 9) + // Restante do campo 1
    campo2.substring(0, 10) + // Campo 2 sem DV
    campo3.substring(0, 10); // Campo 3 sem DV

  return codigoBarras;
}

/**
 * Calcula a data de vencimento a partir do fator de vencimento
 */
function calcularVencimento(fatorVencimento: string): Date {
  const fator = parseInt(fatorVencimento, 10);
  
  if (fator === 0 || isNaN(fator)) {
    // Se fator for 0, não tem vencimento definido
    return new Date();
  }

  // Data base: 07/10/1997 (padrão FEBRABAN)
  const dataBase = new Date(1997, 9, 7);
  const vencimento = new Date(dataBase);
  vencimento.setDate(vencimento.getDate() + fator);

  return vencimento;
}

/**
 * Valida dígito verificador usando módulo 10
 */
function modulo10(numero: string): number {
  let soma = 0;
  let multiplicador = 2;

  for (let i = numero.length - 1; i >= 0; i--) {
    let resultado = parseInt(numero[i]) * multiplicador;
    if (resultado > 9) {
      resultado = Math.floor(resultado / 10) + (resultado % 10);
    }
    soma += resultado;
    multiplicador = multiplicador === 2 ? 1 : 2;
  }

  const resto = soma % 10;
  return resto === 0 ? 0 : 10 - resto;
}

/**
 * Valida dígito verificador usando módulo 11
 */
function modulo11(numero: string): number {
  const sequencia = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  let multiplicadorIndex = 0;

  for (let i = numero.length - 1; i >= 0; i--) {
    soma += parseInt(numero[i]) * sequencia[multiplicadorIndex];
    multiplicadorIndex = (multiplicadorIndex + 1) % sequencia.length;
  }

  const resto = soma % 11;
  const dv = 11 - resto;

  if (dv === 0 || dv === 10 || dv === 11) {
    return 1;
  }

  return dv;
}

/**
 * Valida linha digitável de boleto bancário
 */
export function validarLinhaDigitavel(linha: string): boolean {
  linha = linha.replace(/[.\s]/g, "");

  if (linha.length !== 47) {
    return false;
  }

  // Valida campo 1 (posições 0-9, DV na posição 9)
  const campo1Base = linha.substring(0, 9);
  const campo1DV = parseInt(linha[9]);
  if (modulo10(campo1Base) !== campo1DV) {
    return false;
  }

  // Valida campo 2 (posições 10-20, DV na posição 20)
  const campo2Base = linha.substring(10, 20);
  const campo2DV = parseInt(linha[20]);
  if (modulo10(campo2Base) !== campo2DV) {
    return false;
  }

  // Valida campo 3 (posições 21-31, DV na posição 31)
  const campo3Base = linha.substring(21, 31);
  const campo3DV = parseInt(linha[31]);
  if (modulo10(campo3Base) !== campo3DV) {
    return false;
  }

  return true;
}

/**
 * Parseia linha digitável e retorna dados do boleto
 */
export function parseBoleto(linhaOuCodigo: string): BoletoData {
  let linhaDigitavel = linhaOuCodigo.replace(/[.\s]/g, "");
  let codigoBarras: string;

  // Detecta se é linha digitável (47) ou código de barras (44)
  if (linhaDigitavel.length === 47) {
    if (!validarLinhaDigitavel(linhaDigitavel)) {
      throw new Error("Linha digitável inválida");
    }
    codigoBarras = linhaDigitavelToCodigoBarras(linhaDigitavel);
  } else if (linhaDigitavel.length === 44) {
    // É código de barras
    codigoBarras = linhaDigitavel;
    // Converte para linha digitável (não implementado aqui por simplicidade)
    linhaDigitavel = "";
  } else {
    throw new Error("Código inválido. Deve ter 44 ou 47 dígitos");
  }

  // Extrai informações do código de barras
  const codigoBanco = codigoBarras.substring(0, 3);
  const codigoMoeda = codigoBarras.substring(3, 4);
  const dvGeral = codigoBarras.substring(4, 5);
  const fatorVencimento = codigoBarras.substring(5, 9);
  const valorString = codigoBarras.substring(9, 19);
  const campoLivre = codigoBarras.substring(19, 44);

  // Calcula valor (divide por 100 para obter centavos)
  const valor = parseInt(valorString, 10) / 100;

  // Calcula vencimento
  const vencimento = calcularVencimento(fatorVencimento);

  // Nome do banco
  const bancoNome = BANCOS[codigoBanco] || "Banco desconhecido";

  return {
    linhaDigitavel: linhaDigitavel || codigoBarras,
    codigoBarras,
    banco: codigoBanco,
    bancoNome,
    valor,
    vencimento,
    nossoNumero: campoLivre.substring(0, 11), // Posição varia por banco
  };
}

/**
 * Formata linha digitável para exibição (com pontos e espaços)
 */
export function formatarLinhaDigitavel(linha: string): string {
  linha = linha.replace(/[.\s]/g, "");

  if (linha.length !== 47) {
    return linha;
  }

  return `${linha.substring(0, 5)}.${linha.substring(5, 10)} ${linha.substring(
    10,
    15
  )}.${linha.substring(15, 21)} ${linha.substring(21, 26)}.${linha.substring(
    26,
    32
  )} ${linha.substring(32, 33)} ${linha.substring(33, 47)}`;
}
