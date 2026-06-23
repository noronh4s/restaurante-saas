-- Tabela de Insumos
CREATE TABLE insumos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'un',
  preco_unitario DECIMAL(10,2) NOT NULL,
  quantidade_estoque DECIMAL(10,2) DEFAULT 0
);

ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver seus insumos"
  ON insumos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir seus insumos"
  ON insumos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar seus insumos"
  ON insumos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar seus insumos"
  ON insumos FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela de Pratos
CREATE TABLE pratos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  preco_venda DECIMAL(10,2)
);

ALTER TABLE pratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver seus pratos"
  ON pratos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir seus pratos"
  ON pratos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar seus pratos"
  ON pratos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem deletar seus pratos"
  ON pratos FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela de Fichas Técnicas (ingredientes de cada prato)
CREATE TABLE fichas_tecnicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  prato_id UUID REFERENCES pratos(id) ON DELETE CASCADE NOT NULL,
  insumo_id UUID REFERENCES insumos(id) ON DELETE CASCADE NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  custo_total DECIMAL(10,2) DEFAULT 0,
  preco_sugerido DECIMAL(10,2) DEFAULT 0
);

ALTER TABLE fichas_tecnicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver fichas dos seus pratos"
  ON fichas_tecnicas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pratos WHERE pratos.id = fichas_tecnicas.prato_id AND pratos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem inserir fichas dos seus pratos"
  ON fichas_tecnicas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pratos WHERE pratos.id = fichas_tecnicas.prato_id AND pratos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem atualizar fichas dos seus pratos"
  ON fichas_tecnicas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pratos WHERE pratos.id = fichas_tecnicas.prato_id AND pratos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem deletar fichas dos seus pratos"
  ON fichas_tecnicas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pratos WHERE pratos.id = fichas_tecnicas.prato_id AND pratos.user_id = auth.uid()
    )
  );

-- Tabela de Movimentação de Estoque
CREATE TABLE movimentacoes_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  insumo_id UUID REFERENCES insumos(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade DECIMAL(10,2) NOT NULL,
  observacao TEXT
);

ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver movimentacoes"
  ON movimentacoes_estoque FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir movimentacoes"
  ON movimentacoes_estoque FOR INSERT
  WITH CHECK (auth.uid() = user_id);
