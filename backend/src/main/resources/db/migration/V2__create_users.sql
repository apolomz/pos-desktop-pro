CREATE TABLE users (

                       id BIGSERIAL PRIMARY KEY,

                       full_name VARCHAR(150) NOT NULL,

                       username VARCHAR(120) NOT NULL UNIQUE,

                       password VARCHAR(255) NOT NULL,

                       role_id BIGINT NOT NULL,

                       CONSTRAINT fk_user_role
                           FOREIGN KEY(role_id)
                               REFERENCES roles(id)
);