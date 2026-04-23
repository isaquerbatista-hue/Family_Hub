-- ============================================================
-- FAMILY HUB — Schema Completo do Banco de Dados
-- Compatível com PostgreSQL / Supabase
-- ============================================================


-- ============================================================
-- 1. FAMÍLIAS
--    Cada instância do sistema pertence a uma família.
-- ============================================================
CREATE TABLE familias (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(120)  NOT NULL,            -- Ex: "Família Silva"
    fuso_horario VARCHAR(60)  NOT NULL DEFAULT 'America/Sao_Paulo',
    criado_em   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. MEMBROS
--    Usuários da família. Papéis: 'admin' ou 'membro'.
-- ============================================================
CREATE TABLE membros (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id      UUID         NOT NULL REFERENCES familias(id) ON DELETE CASCADE,

    -- Autenticação
    email           VARCHAR(254) NOT NULL UNIQUE,
    senha_hash      TEXT         NOT NULL,          -- bcrypt/argon2
    token_recuperacao TEXT,                         -- para fluxo "esqueci minha senha"
    token_expira_em  TIMESTAMPTZ,

    -- Perfil
    nome            VARCHAR(120) NOT NULL,          -- nome de exibição
    iniciais        VARCHAR(4),                     -- Ex: "F1", "M"
    cor_avatar      VARCHAR(9)   DEFAULT '#888888', -- hex
    papel           VARCHAR(20)  NOT NULL DEFAULT 'membro' CHECK (papel IN ('admin','membro')),

    -- Gamificação
    pontos          INTEGER      NOT NULL DEFAULT 0 CHECK (pontos >= 0),

    -- Preferências (JSON denormalizado para evitar tabela extra)
    notif_email_diario   BOOLEAN NOT NULL DEFAULT TRUE,
    notif_tarefas_atraso BOOLEAN NOT NULL DEFAULT TRUE,
    notif_atribuicao     BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_membros_familia ON membros(familia_id);
CREATE INDEX idx_membros_email   ON membros(email);


-- ============================================================
-- 3. TAREFAS
-- ============================================================
CREATE TABLE tarefas (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id  UUID         NOT NULL REFERENCES familias(id) ON DELETE CASCADE,

    titulo      VARCHAR(255) NOT NULL,
    descricao   TEXT,
    tag         VARCHAR(80),                        -- categoria livre: Cozinha, Jardim...

    prioridade  VARCHAR(10)  NOT NULL DEFAULT 'baixa'
                CHECK (prioridade IN ('baixa','media','alta')),

    status      VARCHAR(20)  NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo','progress','done')),

    prazo       DATE,                               -- data de vencimento (YYYY-MM-DD)

    -- Ordem de exibição no Kanban (drag-and-drop)
    ordem       INTEGER      NOT NULL DEFAULT 0,

    criado_por  UUID         REFERENCES membros(id) ON DELETE SET NULL,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    concluido_em  TIMESTAMPTZ                       -- preenchido ao status='done'
);

CREATE INDEX idx_tarefas_familia   ON tarefas(familia_id);
CREATE INDEX idx_tarefas_status    ON tarefas(status);
CREATE INDEX idx_tarefas_prioridade ON tarefas(prioridade);
CREATE INDEX idx_tarefas_prazo     ON tarefas(prazo);


-- ============================================================
-- 4. ATRIBUIÇÕES DE TAREFAS  (N:N — tarefa ↔ membro)
-- ============================================================
CREATE TABLE tarefa_membros (
    tarefa_id   UUID NOT NULL REFERENCES tarefas(id)  ON DELETE CASCADE,
    membro_id   UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    PRIMARY KEY (tarefa_id, membro_id)
);


-- ============================================================
-- 5. ATIVIDADE / HISTÓRICO DE TAREFAS
--    Feed de eventos: criação, edição, conclusão, reabertura.
-- ============================================================
CREATE TABLE tarefa_atividades (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tarefa_id   UUID        NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
    membro_id   UUID        REFERENCES membros(id) ON DELETE SET NULL,
    tipo        VARCHAR(40) NOT NULL
                CHECK (tipo IN ('criou','editou','concluiu','reabriu','excluiu','comentou','atribuiu')),
    detalhe     TEXT,                               -- texto livre / diff resumido
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_atividade_tarefa ON tarefa_atividades(tarefa_id);


-- ============================================================
-- 6. RECOMPENSAS
-- ============================================================
CREATE TABLE recompensas (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id  UUID         NOT NULL REFERENCES familias(id) ON DELETE CASCADE,

    nome        VARCHAR(200) NOT NULL,
    descricao   TEXT,
    pontos      INTEGER      NOT NULL CHECK (pontos > 0),

    categoria   VARCHAR(40)  NOT NULL DEFAULT 'entretenimento'
                CHECK (categoria IN ('viagem','entretenimento','descanso','compras','comida','esportes')),

    -- NULL = ilimitado; inteiro = nº máximo de resgates disponíveis
    limite      INTEGER      CHECK (limite IS NULL OR limite >= 0),

    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,

    criado_por  UUID         REFERENCES membros(id) ON DELETE SET NULL,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recompensas_familia  ON recompensas(familia_id);
CREATE INDEX idx_recompensas_categoria ON recompensas(categoria);


-- ============================================================
-- 7. RESGATES
--    Registra cada vez que um membro resgata uma recompensa.
-- ============================================================
CREATE TABLE resgates (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    recompensa_id UUID        NOT NULL REFERENCES recompensas(id) ON DELETE CASCADE,
    membro_id     UUID        NOT NULL REFERENCES membros(id)     ON DELETE CASCADE,
    pontos_gastos INTEGER     NOT NULL,             -- snapshot do custo no momento do resgate
    resgatado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resgates_membro     ON resgates(membro_id);
CREATE INDEX idx_resgates_recompensa ON resgates(recompensa_id);


-- ============================================================
-- 8. PONTUAÇÃO / HISTÓRICO DE PONTOS
--    Créditos (tarefa concluída) e débitos (resgate).
-- ============================================================
CREATE TABLE pontuacao_historico (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id   UUID        NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    delta       INTEGER     NOT NULL,               -- positivo = ganho, negativo = gasto
    motivo      VARCHAR(60) NOT NULL
                CHECK (motivo IN ('tarefa_concluida','resgate','ajuste_manual','bonus')),
    referencia_id UUID,                             -- id da tarefa ou resgate relacionado
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pontos_membro ON pontuacao_historico(membro_id);


-- ============================================================
-- 9. EVENTOS DA AGENDA (Mini-Agenda / Calendário)
-- ============================================================
CREATE TABLE eventos (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id  UUID         NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
    titulo      VARCHAR(255) NOT NULL,
    descricao   TEXT,
    categoria   VARCHAR(40)  NOT NULL DEFAULT 'outros'
                CHECK (categoria IN ('escolar','esportes','sociais','saude','trabalho','outros')),
    inicio      TIMESTAMPTZ  NOT NULL,
    fim         TIMESTAMPTZ,
    dia_inteiro BOOLEAN      NOT NULL DEFAULT FALSE,
    criado_por  UUID         REFERENCES membros(id) ON DELETE SET NULL,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eventos_familia ON eventos(familia_id);
CREATE INDEX idx_eventos_inicio  ON eventos(inicio);


-- ============================================================
-- 10. PARTICIPANTES DE EVENTOS (N:N)
-- ============================================================
CREATE TABLE evento_membros (
    evento_id   UUID NOT NULL REFERENCES eventos(id)  ON DELETE CASCADE,
    membro_id   UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    PRIMARY KEY (evento_id, membro_id)
);


-- ============================================================
-- 11. NOTIFICAÇÕES
--    Feed de avisos exibido no Dashboard.
-- ============================================================
CREATE TABLE notificacoes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id   UUID        NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    tipo        VARCHAR(40) NOT NULL
                CHECK (tipo IN ('tarefa_atribuida','tarefa_concluida','tarefa_atrasada','resgate','evento','sistema')),
    mensagem    TEXT        NOT NULL,
    referencia_id UUID,                             -- id da tarefa, resgate ou evento
    lida        BOOLEAN     NOT NULL DEFAULT FALSE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notificacoes_membro ON notificacoes(membro_id);
CREATE INDEX idx_notificacoes_lida   ON notificacoes(membro_id, lida);


-- ============================================================
-- 12. SESSÕES DE AUTENTICAÇÃO  (tokens de login)
-- ============================================================
CREATE TABLE sessoes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id   UUID        NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    token       TEXT        NOT NULL UNIQUE,        -- JWT ou token opaco
    ip          INET,
    user_agent  TEXT,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expira_em   TIMESTAMPTZ NOT NULL,
    revogado    BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_sessoes_membro ON sessoes(membro_id);
CREATE INDEX idx_sessoes_token  ON sessoes(token);


-- ============================================================
-- DADOS DE EXEMPLO  (seed)
-- ============================================================

-- Família
INSERT INTO familias (id, nome) VALUES
    ('11111111-0000-0000-0000-000000000001', 'Família Silva');

-- Membros
INSERT INTO membros (id, familia_id, email, senha_hash, nome, iniciais, cor_avatar, papel, pontos) VALUES
    ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001',
     'pai@email.com',   '$2b$10$placeholder_hash', 'Pai',    'P',  '#3b82f6', 'admin',  50),
    ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001',
     'mae@email.com',   '$2b$10$placeholder_hash', 'Mãe',   'M',  '#ec4899', 'admin',  150),
    ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001',
     'filho@email.com', '$2b$10$placeholder_hash', 'Filho 1','F1', '#f59e0b', 'membro', 80),
    ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001',
     'filha@email.com', '$2b$10$placeholder_hash', 'Filha 2','F2', '#10b981', 'membro', 60);

-- Tarefas
INSERT INTO tarefas (id, familia_id, titulo, descricao, tag, prioridade, status, prazo, ordem, criado_por) VALUES
    (gen_random_uuid(), '11111111-0000-0000-0000-000000000001',
     'Comprar pão e leite', 'Supermercado mais próximo. Leite semi-desnatado.',
     'Compras', 'media', 'todo', '2025-04-17', 1, '22222222-0000-0000-0000-000000000001'),
    (gen_random_uuid(), '11111111-0000-0000-0000-000000000001',
     'Levar o lixo', 'Sacos pretos no armário da lavanderia.',
     'Limpeza', 'alta', 'done', '2025-04-16', 2, '22222222-0000-0000-0000-000000000002'),
    (gen_random_uuid(), '11111111-0000-0000-0000-000000000001',
     'Regar as plantas', 'Jardim e vasos internos.',
     'Jardim', 'baixa', 'todo', '2025-04-20', 3, '22222222-0000-0000-0000-000000000002'),
    (gen_random_uuid(), '11111111-0000-0000-0000-000000000001',
     'Preparar jantar de domingo', 'Receita de lasanha no livro da cozinha.',
     'Cozinha', 'media', 'progress', '2025-04-21', 4, '22222222-0000-0000-0000-000000000002'),
    (gen_random_uuid(), '11111111-0000-0000-0000-000000000001',
     'Pagar contas do mês', 'IPTU e condomínio vencem dia 20.',
     'Finanças', 'alta', 'progress', '2025-04-20', 5, '22222222-0000-0000-0000-000000000001');

-- Recompensas
INSERT INTO recompensas (familia_id, nome, descricao, pontos, categoria, limite, ativo, criado_por) VALUES
    ('11111111-0000-0000-0000-000000000001',
     'Passeio no parque local', 'Passeio divertido no parque da cidade',
     300, 'viagem', NULL, TRUE, '22222222-0000-0000-0000-000000000001'),
    ('11111111-0000-0000-0000-000000000001',
     'Ida ao cinema com a família', 'Ingressos para o cinema em família',
     500, 'viagem', NULL, TRUE, '22222222-0000-0000-0000-000000000001'),
    ('11111111-0000-0000-0000-000000000001',
     '1h extra de videogame', 'Uma hora adicional para jogar videogame',
     200, 'entretenimento', 5, TRUE, '22222222-0000-0000-0000-000000000001'),
    ('11111111-0000-0000-0000-000000000001',
     'Dia sem tarefas domésticas', 'Férias das tarefas domésticas por um dia',
     600, 'descanso', 3, TRUE, '22222222-0000-0000-0000-000000000001'),
    ('11111111-0000-0000-0000-000000000001',
     'Pizza da escolha', 'Você escolhe o sabor da pizza da semana',
     400, 'comida', NULL, TRUE, '22222222-0000-0000-0000-000000000001');

-- Eventos da agenda
INSERT INTO eventos (familia_id, titulo, categoria, inicio, dia_inteiro, criado_por) VALUES
    ('11111111-0000-0000-0000-000000000001',
     'Reunião de Pais', 'escolar',
     NOW()::date + INTERVAL '19 hours', FALSE, '22222222-0000-0000-0000-000000000001'),
    ('11111111-0000-0000-0000-000000000001',
     'Futebol Filho 1', 'esportes',
     (NOW()::date + INTERVAL '1 day') + INTERVAL '8 hours', FALSE, '22222222-0000-0000-0000-000000000001'),
    ('11111111-0000-0000-0000-000000000001',
     'Almoço em Família', 'sociais',
     (NOW()::date + (7 - EXTRACT(DOW FROM NOW())::int) % 7 + 7) + INTERVAL '13 hours',
     FALSE, '22222222-0000-0000-0000-000000000001');
