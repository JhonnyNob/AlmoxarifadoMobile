CREATE DATABASE IF NOT EXISTS almoxarifado
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE almoxarifado;

CREATE TABLE usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nome_usuario VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY nome_usuario (nome_usuario)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE itens (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY unico_usuario_item (usuario_id, nome),
    CONSTRAINT fk_itens_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;