import { collection, doc, getDocs, setDoc, query, orderBy, deleteDoc, addDoc, where, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { BlogPost } from '../types';

const BLOG_COLLECTION = 'posts';

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
      
      <p>Cada uma de nossas ferramentas foi projetada para resolver EXATAMENTE um problem. Essa abordagem cirúrgica garante que você não se perca em menus infinitos.</p>
      
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
    id: '4',
    title: 'Como reduzir o retrabalho contábil no dia a dia',
    slug: 'reduzir-retrabalho-contabil',
    summary: 'Veja como eliminar tarefas repetitivas e ganhar produtividade com soluções simples.',
    content: `
      <p>O retrabalho é um dos maiores vilões da produtividade nos escritórios de contabilidade. Muitas vezes, o contador se vê redigitando dados que já existem em outros sistemas ou corrigindo erros que poderiam ser evitados com automação.</p>
      
      <h3>A causa do retrabalho</h3>
      <p>Sistemas complexos e falta de integração são os principais culpados. Quando a ferramenta é difícil de usar, o erro humano se torna frequente.</p>
      
      <h3>A solução MicroCaaS</h3>
      <p>Ao utilizar ferramentas específicas para cada tarefa, você elimina camadas de complexidade. Menos cliques, menos campos para preencher e validações automáticas garantem que o trabalho seja feito certo da primeira vez.</p>
      
      <p><strong>Mensagem:</strong> Menos retrabalho = mais produtividade para focar no que realmente importa: a consultoria para o seu cliente.</p>
    `,
    image: 'https://images.unsplash.com/photo-1454165833767-02750e5eb4e4?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '5',
    title: 'Por que planilhas ainda travam a produtividade do contador',
    slug: 'planilhas-travam-produtividade',
    summary: 'Entenda como o uso excessivo de planilhas pode estar atrasando seu trabalho e gerando riscos.',
    content: `
      <p>Planilhas são ótimas aliadas, mas quando se tornam a base da operação, viram um problema. Elas não possuem auditoria, perdem referências facilmente e dependem totalmente da memória de quem as criou.</p>
      
      <h3>O perigo das "Planilhas de Controle"</h3>
      <p>Quantas vezes você já se deparou com uma planilha corrompida ou com fórmulas erradas que passaram despercebidas? Na contabilidade, um erro de célula pode significar uma multa pesada.</p>
      
      <h3>IA e Microsserviços vs Excel</h3>
      <p>Ferramentas dedicadas oferecem o que o Excel não consegue: persistência de dados, histórico de alterações e validação em tempo real. É hora de aposentar as planilhas complexas e adotar fluxos de trabalho inteligentes.</p>
    `,
    image: 'https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '6',
    title: 'Aumentando a rentabilidade do escritório com IA',
    slug: 'rentabilidade-escritorio-ia',
    summary: 'A inteligência artificial não vai substituir o contador, mas vai tornar seu escritório muito mais lucrativo.',
    content: `
      <p>A IA é a nova eletricidade para o setor contábil. Ela permite processar volumes massivos de dados em frações de segundo, identificando padrões que passariam batidos ao olho humano.</p>
      <p>Com a automação de tarefas básicas, o custo operacional cai drasticamente, permitindo que o escritório atenda mais clientes com a mesma equipe, ou ofereça serviços de maior valor agregado.</p>
    `,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2400&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: '7',
    title: 'O fim das pilhas de papel no setor fiscal',
    slug: 'fim-pilhas-papel-fiscal',
    summary: 'A jornada para um departamento fiscal 100% digital e sem estresse.',
    content: `
      <p>O setor fiscal sempre foi sinônimo de arquivos e pilhas de papel. Mas isso está mudando. Com a digitalização forçada por órgãos como a RFB, a oportunidade de ser 100% digital é agora.</p>
      <p>Ferramentas de captura automática de documentos eliminam a necessidade de conferência manual e armazenamento físico, reduzindo custos de logística e espaço.</p>
    `,
    image: 'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: '8',
    title: 'Segurança de dados: os riscos que seu escritório corre hoje',
    slug: 'seguranca-dados-riscos-escritorio',
    summary: 'Proteja o bem mais precioso do seu cliente: as informações financeiras e fiscais.',
    content: `
      <p>Contadores lidam com dados sensíveis de centenas de empresas. Um vazamento pode ser fatal. A segurança não é mais um luxo, é uma questão de conformidade legal (LGPD) e sobrevivência.</p>
      <p>Usar soluções em nuvem com criptografia de ponta a ponta é o primeiro passo para garantir que os dados de seus clientes estejam sempre protegidos contra ataques e falhas físicas.</p>
    `,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    updatedAt: new Date(Date.now() - 518400000).toISOString()
  },
  {
    id: '9',
    title: 'Gestão de talentos na contabilidade moderna',
    slug: 'gestao-talentos-contabilidade',
    summary: 'Como atrair e reter bons profissionais em um mercado cada vez mais tecnológico.',
    content: `
      <p>O perfil do profissional contábil mudou. Eles buscam ambientes que utilizem tecnologia de ponta e que valorizem o pensamento analítico em vez da digitação repetitiva.</p>
      <p>Oferecer ferramentas modernas é uma forma de reter talentos, pois reduz o estresse operacional e permite que o colaborador veja o valor real do seu trabalho.</p>
    `,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop',
    status: 'published',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString()
  }
];

export const blogService = {
  async getPosts(): Promise<BlogPost[]> {
    try {
      const q = query(collection(db, BLOG_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BlogPost));
      
      if (posts.length === 0) {
        return INITIAL_POSTS;
      }
      return posts;
    } catch (error) {
       console.warn("Blog collection issue, falling back to static data", error);
       try { handleFirestoreError(error, OperationType.LIST, BLOG_COLLECTION); } catch(e) {}
       return INITIAL_POSTS;
    }
  },

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const posts = await this.getPosts();
      return posts.find(p => p.slug === slug);
    } catch (error) {
      return undefined;
    }
  },

  async savePost(post: BlogPost): Promise<void> {
     try {
       const id = post.id || post.slug;
       const data = {
         ...post,
         updatedAt: new Date().toISOString()
       };
       if (!post.createdAt) data.createdAt = new Date().toISOString();
       
       await setDoc(doc(db, BLOG_COLLECTION, id), data, { merge: true });
     } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, BLOG_COLLECTION);
     }
  },

  async deletePost(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, BLOG_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, BLOG_COLLECTION);
    }
  }
};
