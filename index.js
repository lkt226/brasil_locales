const axios = require('axios');
const fs = require('fs');

// Pega todos os estados
const estados = async () => {
    const baseURL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
    const { data } = await axios.get(baseURL);
    
    const result = data.map(estado => ({
        id: estado.id,
        nome: estado.nome,
        sigla: estado.sigla
    }))

    fs.writeFileSync('./src/estados.json', JSON.stringify(result));
}

// Pega todos os municipios de cada estado de forma separada
const municipios = async () => {
    const getMunicipios = async (id) => {
        const baseURL = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${id}/municipios`;
        const { data } = await axios.get(baseURL);

        return data.map(municipio => ({
            id: municipio.id,
            nome: municipio.nome,
        }))
    }

    const estados = JSON.parse(fs.readFileSync('./src/estados.json', 'utf8'));

    await Promise.all(estados.map(async estado => {
        const municipios = await getMunicipios(estado.sigla);

        fs.writeFileSync(`./src/municipios/${estado.sigla}.json`, JSON.stringify(municipios));
    }))
}

// Pega todos os municipios de todos os estados de uma vez
const municipiosAll = async () => {
    const estados = JSON.parse(fs.readFileSync('./src/estados.json', 'utf8'));

    const allMunicipios = {}

    await Promise.all(estados.map(async estado => {
        const municipios = JSON.parse(fs.readFileSync(`./src/municipios/${estado.sigla}.json`, 'utf8'));
        allMunicipios[estado.sigla] = municipios;
    }))

    fs.writeFileSync('./src/municipios.json', JSON.stringify(allMunicipios));
}

const update = async () => {
    await estados();
    await municipios();
    await municipiosAll();
}

update()