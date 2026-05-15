import type { BlogPost } from '../types';

const BLOG_KEY = 'microcaas_blog_posts';

const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'A nova forma de fazer contabilidade: menos sistema, mais resultado',
    slug: 'nova-forma-fazer-contabilidade',
    summary: 'Entenda por que os sistemas tradicionais estão ficando para trás e como micro soluções estão mudando o dia a dia contábil.',
    content: `
      <p>Hoje em dia, a contabilidade no Brasil enfrenta um grande desafio: o excesso de burocracia e sistemas extremamente complexos. Os ERPs tradicionais tentam ser um "tamanho único" para todos os problemas, o que acaba gerando mais retrabalho do que agilidade.</p>
      
      <p>A nova revolução que estamos vivenciando é a mudança para o foco no resultado imediato. Menos sistema, mais resultado. Em vez de abrir um software pesado para fazer uma simples conciliação, o contador moderno usa ferramentas cirúrgicas.</p>
      
      <h3>Por que os ERPs tradicionais falham?</h3>
      <ul>
        <li>Complexidade excessiva para tarefas simples.</li>
        <li>Curva de aprendizado longa para novos funcionários.</li>
        <li>Dependência de suporte técnico constante.</li>
        <li>Rigidez em processos que deveriam ser dinâmicos.</li>
      </ul>

      <p>As micro soluções resolvem este problema focando em tarefas específicas, permitindo que você resolva em segundos o que antes levava horas.</p>
    `,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Micro soluções: como resolver problemas contábeis em minutos',
    slug: 'micro-solucoes-resolver-problemas',
    summary: 'Descubra como pequenas ferramentas podem eliminar horas de trabalho manual no seu dia a dia.',
    content: `
      <p>O conceito de "pílulas de solução" está ganhando força. No dia a dia contábil, muitas vezes você não precisa de um módulo financeiro completo, mas apenas de uma forma rápida de converter um extrato PDF em Excel.</p>
      
      <p>Cada uma de nossas ferramentas foi projetada para resolver EXATAMENTE um problema. Essa abordagem cirúrgica garante que você não se perca em menus infinitos.</p>
      
      <h3>Exemplos de ganho de tempo real:</h3>
      <ul>
        <li><strong>NF-e:</strong> Monitoramento e extração automática.</li>
        <li><strong>Conciliação:</strong> Bate de dados em segundos.</li>
        <li><strong>Fechamento:</strong> Checklists inteligentes que garantem conformidade.</li>
      </ul>

      <p>A produtividade individual do contador é o que define o sucesso do escritório na era digital.</p>
    `,
    image: 'https://images.unsplash.com/photo-1551288049-bbdac8626ad1?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Pare de perder tempo com tarefas manuais na contabilidade',
    slug: 'pare-perder-tempo-tarefas-manuais',
    summary: 'Veja como eliminar digitação, planilhas e retrabalho com ferramentas específicas.',
    content: `
      <p>A digitação manual é a maior inimiga da rentabilidade de um escritório contábil. Cada minuto gasto digitando um lançamento é um minuto que você não gasta analisando dados estrategicamente para seu cliente.</p>
      
      <p>As planilhas são úteis, mas quando o processo se torna repetitivo e propenso a erros, é hora de automatizar.</p>
      
      <h3>O tripé da ineficiência:</h3>
      <ol>
        <li>Digitação manual de documentos físicos.</li>
        <li>Planilhas paralelas sem integração.</li>
        <li>Retrabalho por falta de validação na fonte.</li>
      </ol>

      <p>Ao adotar micro automações, você elimina esses gargalos e foca no que realmente importa: gerar valor para o cliente.</p>
    `,
    image: 'https://images.unsplash.com/photo-1454165833767-1330084b1d3c?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '4',
    title: 'Como reduzir o retrabalho contábil no dia a dia',
    slug: 'reduzir-retrabalho-contabil',
    summary: 'Veja como eliminar tarefas repetitivas e ganhar produtividade com soluções simples.',
    content: `
      <p>O retrabalho é um dos maiores "ladrões de tempo" em qualquer escritório de contabilidade. Muitas vezes, a equipe gasta horas conferindo dados que já foram processados em outro sistema, simplesmente porque a integração falhou ou o sistema principal é complexo demais.</p>
      
      <p>A solução não é contratar mais pessoas, mas sim implementar ferramentas que façam o trabalho pesado de conferência de forma automática.</p>
      
      <h3>O caminho para a eficiência:</h3>
      <ul>
        <li>Identificação de processos repetitivos.</li>
        <li>Substituição de conferência manual por lógica automatizada.</li>
        <li>Uso de ferramentas que "conversam" entre si sem burocracia.</li>
      </ul>

      <p>Menos retrabalho significa uma equipe mais motivada e uma margem de lucro maior para o seu negócio.</p>
    `,
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '5',
    title: 'Por que planilhas ainda travam a produtividade do contador',
    slug: 'planilhas-travam-produtividade',
    summary: 'Entenda como o uso excessivo de planilhas pode estar atrasando seu trabalho.',
    content: `
      <p>O Microsoft Excel é uma ferramenta fantástica, mas ele não foi feito para ser o coração de um escritório contábil escalável. Quando você depende de planilhas para tudo, você cria "ilhas de informação" que são difíceis de auditar e fáceis de corromper.</p>
      
      <p>Erros manuais em fórmulas podem causar prejuízos fiscais enormes para seus clientes e comprometer a confiança no seu trabalho.</p>
      
      <h3>Os limites da planilha:</h3>
      <ul>
        <li>Falta de rastreabilidade de alterações.</li>
        <li>Dificuldade de consolidação de dados em larga escala.</li>
        <li>Dependência de um "expert" que criou a planilha.</li>
      </ul>

      <p>A alternativa é migrar para automações simples (MicroCaaS) que possuem regras de negócio blindadas e focadas em resultados específicos.</p>
    `,
    image: 'https://images.unsplash.com/photo-1554224155-169641357288?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: '6',
    title: 'Como automatizar tarefas fiscais sem complicação',
    slug: 'automatizar-tarefas-fiscais',
    summary: 'Automatize processos fiscais sem precisar de sistemas complexos.',
    content: `
      <p>Muitos contadores acreditam que para automatizar a área fiscal é necessário um projeto de TI de seis meses. Isso é um mito. A automação fiscal moderna pode ser feita através de pequenas ferramentas que resolvem dores atômicas.</p>
      
      <p>Seja baixando XMLs, validando alíquotas ou gerando guias de impostos, a automação prática é aquela que você começa a usar hoje.</p>
      
      <h3>Exemplos de automação imediata:</h3>
      <ul>
        <li>Monitoramento em tempo real de NF-e emitidas contra o cliente.</li>
        <li>Cálculo automático de substituição tributária.</li>
        <li>Consolidação de fechamento em lote.</li>
      </ul>

      <p>A automação simples funciona porque ela foca na dor real, não em funcionalidades que ninguém usa.</p>
    `,
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: '7',
    title: 'O fim dos sistemas contábeis pesados?',
    slug: 'fim-sistemas-contabeis-pesados',
    summary: 'Veja por que o mercado está mudando para soluções mais simples e rápidas.',
    content: `
      <p>Estamos vendo o nascimento de uma nova era na tecnologia contábil. Os ERPs grandes e lentos estão perdendo espaço para ecossistemas de micro-serviços. O motivo? Agilidade.</p>
      
      <p>O custo de manter um sistema legado é alto, tanto em termos financeiros quanto em tempo de treinamento. O MicroCaaS (Micro Accounting as a Service) surge como a solução para quem quer eficiência sem o peso de um software gigante.</p>
      
      <h3>A mudança de paradigma:</h3>
      <ul>
        <li><strong>De:</strong> Um sistema que faz tudo (mais ou menos).</li>
        <li><strong>Para:</strong> Dez ferramentas que fazem uma coisa cada (com perfeição).</li>
      </ul>

      <p>O resultado final é menos sistema e muito mais resultado para o contador e seu cliente.</p>
    `,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    updatedAt: new Date(Date.now() - 518400000).toISOString()
  },
  {
    id: '8',
    title: 'Como ganhar escala no escritório contábil sem aumentar equipe',
    slug: 'ganhar-escala-sem-aumentar-equipe',
    summary: 'Descubra como atender mais clientes sem aumentar custos.',
    content: `
      <p>O limite de crescimento de muitos escritórios é o limite operacional da sua equipe. Quando cada novo cliente significa a necessidade de contratar um novo assistente, o seu negócio não possui escala real.</p>
      
      <p>Para escalar com eficiência, você precisa desvincular o faturamento do número de horas homem trabalhadas.</p>
      
      <h3>Estratégias de escala:</h3>
      <ul>
        <li>Padronização radical de processos de entrada de dados.</li>
        <li>Uso de micro automações para tarefas de baixo valor agregado.</li>
        <li>Foco da equipe em consultoria e análise estratégica.</li>
      </ul>

      <p>A tecnologia certa permite que você atenda o dobro de clientes com a mesma estrutura atual.</p>
    `,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString()
  },
  {
    id: '9',
    title: 'Pequenas soluções que resolvem grandes problemas contábeis',
    slug: 'pequenas-solucoes-grandes-problemas',
    summary: 'Entenda como ferramentas simples podem substituir sistemas complexos.',
    content: `
      <p>Muitas vezes, a solução para um grande problema contábil não é um software de mil dólares, mas sim uma ferramenta simples que limpa e organiza seus dados antes que eles entrem no sistema principal.</p>
      
      <p>O conceito de micro solução é focar no gargalo. Se o seu fechamento atrasa por causa da demora no recebimento de extratos, resolva o recebimento de extratos primeiro.</p>
      
      <h3>Simplicidade resolve:</h3>
      <ul>
        <li>Foco total no problema específico.</li>
        <li>Implementação imediata sem treinamento complexo.</li>
        <li>Custo reduzido e alto retorno sobre o investimento.</li>
      </ul>

      <p>No final das contas, o que importa é a agilidade que você ganha para focar na estratégia do seu escritório.</p>
    `,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    updatedAt: new Date(Date.now() - 691200000).toISOString()
  }
];

export const blogService = {
  async getPosts(): Promise<BlogPost[]> {
    const data = localStorage.getItem(BLOG_KEY);
    if (!data) {
      localStorage.setItem(BLOG_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    const currentPosts = JSON.parse(data);
    
    // Auto-migration: if we have added new default posts in code, merge them
    if (currentPosts.length < INITIAL_POSTS.length) {
      const merged = [...currentPosts];
      INITIAL_POSTS.forEach(initialPost => {
        if (!merged.find(p => p.slug === initialPost.slug)) {
          merged.push(initialPost);
        }
      });
      localStorage.setItem(BLOG_KEY, JSON.stringify(merged));
      return merged;
    }
    
    return currentPosts;
  },

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const posts = await this.getPosts();
    return posts.find(p => p.slug === slug);
  },

  async savePost(post: BlogPost): Promise<void> {
    const posts = await this.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    
    let updatedPosts;
    if (index >= 0) {
      updatedPosts = [...posts];
      updatedPosts[index] = { ...post, updatedAt: new Date().toISOString() };
    } else {
      updatedPosts = [{ ...post, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...posts];
    }
    
    localStorage.setItem(BLOG_KEY, JSON.stringify(updatedPosts));
  },

  async deletePost(id: string): Promise<void> {
    const posts = await this.getPosts();
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem(BLOG_KEY, JSON.stringify(updated));
  }
};
