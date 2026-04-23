-- ============================================================
-- FAMILY HUB — Schema MySQL 8
-- Execute: mysql -u root -p family_hub < schema_mysql.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS family_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE family_hub;

-- ============================================================
-- 1. FAMILIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS familias (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    nome          VARCHAR(120) NOT NULL,
    fuso_horario  VARCHAR(60)  NOT NULL DEFAULT 'America/Sao_Paulo',
    criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. MEMBROS
-- ============================================================
CREATE TABLE IF NOT EXISTS membros (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    familia_id      CHAR(36)     NOT NULL,
    email           VARCHAR(254) NOT NULL,
    senha_hash      VARCHAR(255) NOT NULL,
    token_recuperacao VARCHAR(128) NULL,
    token_expira_em DATETIME     NULL,
    nome            VARCHAR(120) NOT NULL,
    iniciais        VARCHAR(4)   NULL,
    cor_avatar      VARCHAR(9)   NOT NULL DEFAULT '#888888',
    papel           ENUM('admin','membro') NOT NULL DEFAULT 'membro',
    pontos          INT          NOT NULL DEFAULT 0,
    notif_email_diario   TINYINT(1) NOT NULL DEFAULT 1,
    notif_tarefas_atraso TINYINT(1) NOT NULL DEFAULT 1,
    notif_atribuicao     TINYINT(1) NOT NULL DEFAULT 1,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email (email),
    CONSTRAINT fk_membros_familia FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. TAREFAS
-- ============================================================
CREATE TABLE IF NOT EXISTS tarefas (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    familia_id    CHAR(36)     NOT NULL,
    titulo        VARCHAR(255) NOT NULL,
    descricao     TEXT         NULL,
    tag           VARCHAR(80)  NULL,
    prioridade    ENUM('baixa','media','alta') NOT NULL DEFAULT 'baixa',
    status        ENUM('todo','progress','done') NOT NULL DEFAULT 'todo',
    prazo         DATE         NULL,
    ordem         INT          NOT NULL DEFAULT 0,
    criado_por    CHAR(36)     NULL,
    criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    concluido_em  DATETIME     NULL,
    PRIMARY KEY (id),
    KEY idx_tarefas_familia   (familia_id),
    KEY idx_tarefas_status    (status),
    KEY idx_tarefas_prioridade (prioridade),
    KEY idx_tarefas_prazo     (prazo),
    CONSTRAINT fk_tarefas_familia FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE,
    CONSTRAINT fk_tarefas_criador FOREIGN KEY (criado_por)  REFERENCES membros(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. TAREFA_MEMBROS  (N:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS tarefa_membros (
    tarefa_id  CHAR(36) NOT NULL,
    membro_id  CHAR(36) NOT NULL,
    PRIMARY KEY (tarefa_id, membro_id),
    CONSTRAINT fk_tm_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    CONSTRAINT fk_tm_membro FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. TAREFA_ATIVIDADES
-- ============================================================
CREATE TABLE IF NOT EXISTS tarefa_atividades (
    id         CHAR(36)    NOT NULL DEFAULT (UUID()),
    tarefa_id  CHAR(36)    NOT NULL,
    membro_id  CHAR(36)    NULL,
    tipo       ENUM('criou','editou','concluiu','reabriu','excluiu','comentou','atribuiu') NOT NULL,
    detalhe    TEXT        NULL,
    criado_em  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_atividade_tarefa (tarefa_id),
    CONSTRAINT fk_ativ_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    CONSTRAINT fk_ativ_membro FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. RECOMPENSAS
-- ============================================================
CREATE TABLE IF NOT EXISTS recompensas (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    familia_id  CHAR(36)     NOT NULL,
    nome        VARCHAR(200) NOT NULL,
    descricao   TEXT         NULL,
    pontos      INT          NOT NULL,
    categoria   ENUM('viagem','entretenimento','descanso','compras','comida','esportes') NOT NULL DEFAULT 'entretenimento',
    limite      INT          NULL,
    ativo       TINYINT(1)   NOT NULL DEFAULT 1,
    criado_por  CHAR(36)     NULL,
    criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_recompensas_familia  (familia_id),
    KEY idx_recompensas_categoria (categoria),
    CONSTRAINT fk_recomp_familia FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE,
    CONSTRAINT fk_recomp_criador FOREIGN KEY (criado_por) REFERENCES membros(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. RESGATES
-- ============================================================
CREATE TABLE IF NOT EXISTS resgates (
    id            CHAR(36) NOT NULL DEFAULT (UUID()),
    recompensa_id CHAR(36) NOT NULL,
    membro_id     CHAR(36) NOT NULL,
    pontos_gastos INT      NOT NULL,
    resgatado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_resgates_membro     (membro_id),
    KEY idx_resgates_recompensa (recompensa_id),
    CONSTRAINT fk_resg_recomp  FOREIGN KEY (recompensa_id) REFERENCES recompensas(id) ON DELETE CASCADE,
    CONSTRAINT fk_resg_membro  FOREIGN KEY (membro_id)     REFERENCES membros(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. PONTUACAO_HISTORICO
-- ============================================================
CREATE TABLE IF NOT EXISTS pontuacao_historico (
    id             CHAR(36) NOT NULL DEFAULT (UUID()),
    membro_id      CHAR(36) NOT NULL,
    delta          INT      NOT NULL,
    motivo         ENUM('tarefa_concluida','resgate','ajuste_manual','bonus') NOT NULL,
    referencia_id  CHAR(36) NULL,
    criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pontos_membro (membro_id),
    CONSTRAINT fk_pts_membro FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. EVENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    familia_id  CHAR(36)     NOT NULL,
    titulo      VARCHAR(255) NOT NULL,
    descricao   TEXT         NULL,
    categoria   ENUM('escolar','esportes','sociais','saude','trabalho','outros') NOT NULL DEFAULT 'outros',
    inicio      DATETIME     NOT NULL,
    fim         DATETIME     NULL,
    dia_inteiro TINYINT(1)   NOT NULL DEFAULT 0,
    criado_por  CHAR(36)     NULL,
    criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_eventos_familia (familia_id),
    KEY idx_eventos_inicio  (inicio),
    CONSTRAINT fk_eventos_familia FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE,
    CONSTRAINT fk_eventos_criador FOREIGN KEY (criado_por) REFERENCES membros(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. EVENTO_MEMBROS
-- ============================================================
CREATE TABLE IF NOT EXISTS evento_membros (
    evento_id  CHAR(36) NOT NULL,
    membro_id  CHAR(36) NOT NULL,
    PRIMARY KEY (evento_id, membro_id),
    CONSTRAINT fk_em_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    CONSTRAINT fk_em_membro FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. NOTIFICACOES
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes (
    id             CHAR(36) NOT NULL DEFAULT (UUID()),
    membro_id      CHAR(36) NOT NULL,
    tipo           ENUM('tarefa_atribuida','tarefa_concluida','tarefa_atrasada','resgate','evento','sistema') NOT NULL,
    mensagem       TEXT     NOT NULL,
    referencia_id  CHAR(36) NULL,
    lida           TINYINT(1) NOT NULL DEFAULT 0,
    criado_em      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_membro (membro_id),
    KEY idx_notif_lida   (membro_id, lida),
    CONSTRAINT fk_notif_membro FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. SESSOES PHP (opcional — o PHP usa $_SESSION, mas útil
--     para invalidar sessões remotas ou múltiplos dispositivos)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessoes (
    id         CHAR(36)  NOT NULL DEFAULT (UUID()),
    membro_id  CHAR(36)  NOT NULL,
    token      VARCHAR(255) NOT NULL,
    ip         VARCHAR(45) NULL,
    user_agent TEXT       NULL,
    criado_em  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_em  DATETIME   NOT NULL,
    revogado   TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_token (token(191)),
    KEY idx_sessoes_membro (membro_id),
    CONSTRAINT fk_sess_membro FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
