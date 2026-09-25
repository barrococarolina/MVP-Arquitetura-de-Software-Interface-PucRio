# MVP Arquitetura de Software — Interface

Este projeto é a componente de Front-End do MVP da Sprint **Arquitetura de Software** do Curso de Engenharia de Software da PUC-Rio. 

O MVP é composto de um Front-End com interface web que utiliza HTML, CSS e JavaScript e se comunica por HTTP/REST com a API principal desenvolvida em Flask para o gerenciamento de **alunos e turmas escolares**. A aplicação utiliza **SQLite** para persistência, disponibiliza documentação OpenAPI/Swagger e integra uma **API externa pública (ViaCEP)** para consultar e tratar endereços a partir do CEP informado no cadastro de alunos. A parte do Back-End pode ser acessada em [MVP-Arquitetura-de-Software-API-PucRio](https://github.com/barrococarolina/MVP-Arquitetura-de-Software-API-PucRio).

## Objetivo

Permitir o cadastro, consulta, edição e exclusão de turmas e alunos. No cadastro de alunos, o Back-End consulta a API pública ViaCEP para obter e persistir o endereço associado ao CEP informado.

## Funcionalidades

- Cadastro de turmas.
- Edição de turmas (PUT).
- Exclusão de turmas (DELETE).
- Cadastro de alunos (POST).
- Edição de alunos (PUT).
- Exclusão de alunos (DELETE).
- Consulta de alunos e turmas (GET).
- Busca de alunos por nome/e-mail.
- Filtro por turma.
- Ordenação por nome ou faltas.
- Apresentação do endereço retornado pelo Back-End após a consulta ao ViaCEP.

## Métodos HTTP utilizados pelo Front-End

O Front-End chama explicitamente os quatro métodos exigidos:

- `GET` — carregamento e consulta de alunos/turmas;
- `POST` — criação de alunos/turmas;
- `PUT` — edição de alunos/turmas;
- `DELETE` — exclusão de alunos/turmas.

## Pré-requisitos

- Docker instalado ou um navegador moderno e um servidor HTTP local.

A API deve estar disponível em `http://localhost:5000`.

## Execução com Docker

Construir a imagem:

```bash
docker build -t gerenciamento-escolar-front .
```

Executar:

```bash
docker run --name gerenciamento-escolar-front -p 8080:80 gerenciamento-escolar-front
```

A interface ficará disponível em:

```text
http://localhost:8080
```

O JavaScript usa `http://localhost:5000` como endereço padrão da API.

## Execução local

Também é possível servir os arquivos com qualquer servidor HTTP estático. Por exemplo, com Python:

```bash
python -m http.server 8080
```

Execute o comando dentro da pasta do Front-End e acesse `http://localhost:8080`.

## API utilizada

O Front-End não acessa diretamente o ViaCEP. A comunicação com o serviço externo é responsabilidade da API principal, que trata a resposta e devolve os dados de endereço para a interface.

API principal:

```text
http://localhost:5000
```

## Repositório do Back-End

O Back-End desta aplicação está em um repositório GitHub separado, conforme os requisitos do MVP.
