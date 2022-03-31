import { format, zonedTimeToUtc } from 'date-fns-tz'

import { returnDataInDictOrArray } from '@utils/functions'

interface INFSeGoiania {
    numero: number,
    codigoVerificacao: string,
    dataEmissao: Date,
    statusNota: 'normal' | 'canceled' | 'replaced',
    baseCalculo: number,
    aliquotaIss: number,
    valorIss: number,
    valorServicos: number,
    valorPis: number,
    valorCofins: number,
    valorInss: number,
    valorIr: number,
    valorCsll: number,
    cgcePrestador: string,
    cgceTomador: string,
    nameTomador: string
}

export function NFSeGoiania (nf: object): INFSeGoiania {
    const numero = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'Numero', 0]))
    const codigoVerificacao = returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'CodigoVerificacao', 0])
    let dataEmissao = returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DataEmissao', 0])
    dataEmissao = format(new Date(zonedTimeToUtc(dataEmissao, 'America/Sao_Paulo')), 'yyyy-MM-dd hh:mm:ss a', { timeZone: 'America/Sao_Paulo' })
    const baseCalculo = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'ValoresNfse', 0, 'BaseCalculo', 0]))
    const aliquotaIss = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'ValoresNfse', 0, 'Aliquota', 0]))
    const valorIss = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'ValoresNfse', 0, 'ValorIss', 0]))
    const valorServicos = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Servico', 0, 'Valores', 0, 'ValorServicos', 0]))
    const valorPis = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Servico', 0, 'Valores', 0, 'ValorPis', 0]))
    const valorCofins = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Servico', 0, 'Valores', 0, 'ValorCofins', 0]))
    const valorInss = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Servico', 0, 'Valores', 0, 'ValorInss', 0]))
    const valorIr = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Servico', 0, 'Valores', 0, 'ValorIr', 0]))
    const valorCsll = Number(returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Servico', 0, 'Valores', 0, 'ValorCsll', 0]))

    const cnpjPrestador = returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Prestador', 0, 'CpfCnpj', 0, 'Cnpj', 0])
    const cpfPrestador = returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Prestador', 0, 'CpfCnpj', 0, 'Cpf', 0])
    const cgcePrestador = !cnpjPrestador ? cpfPrestador : cnpjPrestador

    const cnpjTomador = returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Tomador', 0, 'IdentificacaoTomador', 0, 'CpfCnpj', 0, 'Cnpj', 0])
    const cpfTomador = returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Tomador', 0, 'IdentificacaoTomador', 0, 'CpfCnpj', 0, 'Cpf', 0])
    const cgceTomador = !cnpjTomador ? cpfTomador : cnpjTomador

    const nameTomador = returnDataInDictOrArray(nf, ['ListaNfse', 0, 'CompNfse', 0, 'Nfse', 0, 'InfNfse', 0, 'DeclaracaoPrestacaoServico', 0, 'InfDeclaracaoPrestacaoServico', 0, 'Tomador', 0, 'RazaoSocial', 0])

    let statusNota = returnDataInDictOrArray(nf, ['ListaMensagemRetorno', 0, 'MensagemRetorno', 0, 'Mensagem', 0])
    statusNota = statusNota.toUpperCase()
    if (statusNota === 'SUBSTITUIDA') {
        statusNota = 'replaced'
    } else if (statusNota === 'CANCELADA') {
        statusNota = 'canceled'
    } else {
        statusNota = 'normal'
    }

    return {
        numero,
        codigoVerificacao,
        dataEmissao,
        baseCalculo,
        statusNota,
        aliquotaIss,
        valorIss,
        valorServicos,
        valorPis,
        valorCofins,
        valorInss,
        valorIr,
        valorCsll,
        cgcePrestador,
        cgceTomador,
        nameTomador
    }
}