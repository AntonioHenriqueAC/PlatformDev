### criando o package.json

npm init

### instalando todas as dependencias

npm i express express-validator bcryptjs config gravatar jsonwebtoken mongoose request

### instalar nodemon para rodar para front e backend ao mesmo tempo

npm i -D nodemon concurrently

### fazer os scripts no package.json

    "start": "node server",
    "server": "nodemon server"

### derrubar o port que você quer conectar quando já está em uso!!

killall -9 node
