(function () {
  'use strict';

  const stretches = {
    breathing: {
      id: 'breathing',
      name: 'Respiração consciente',
      description: 'Sente-se com a coluna ereta, os ombros relaxados e as mãos apoiadas nas coxas. Inspire lentamente pelo nariz contando até quatro, segure por dois tempos e solte o ar pela boca por seis tempos. Repita em um ritmo confortável, sem forçar a respiração.',
      duration: 45,
      image: 'assets/poses/breathing.svg',
      focus: 'Respiração',
      tip: 'Solte a mandíbula e mantenha os ombros longe das orelhas.'
    },
    'cat-cow': {
      id: 'cat-cow',
      name: 'Gato e vaca',
      description: 'Comece em quatro apoios, com as mãos alinhadas aos ombros e os joelhos na largura do quadril. Na inspiração, deixe a barriga cair, abra o peito e olhe levemente para cima. Na expiração, arredonde as costas, aproxime o queixo do peito e empurre o chão com as mãos. Alterne os movimentos no ritmo da respiração.',
      duration: 60,
      image: 'assets/poses/cat-cow.svg',
      focus: 'Coluna',
      tip: 'Movimente a coluna vértebra por vértebra, sem pressa.'
    },
    'side-bend': {
      id: 'side-bend',
      name: 'Alongamento lateral em pé',
      description: 'Em pé, com os pés paralelos e os joelhos levemente destravados, eleve o braço direito acima da cabeça. Incline o tronco para a esquerda, mantendo o quadril estável e o pescoço longo. Sinta a lateral do corpo abrir e troque de lado na metade do tempo.',
      duration: 45,
      image: 'assets/poses/side-bend.svg',
      focus: 'Lateral do corpo',
      tip: 'Mantenha o peso igualmente distribuído nos dois pés.'
    },
    'shoulder-roll': {
      id: 'shoulder-roll',
      name: 'Círculos de ombro',
      description: 'Em pé, com os braços soltos ao lado do corpo, desenhe círculos grandes com os ombros. Suba-os até as orelhas, leve-os para trás e solte para baixo. Faça metade do tempo em cada direção, mantendo a respiração fluida e o peito aberto.',
      duration: 45,
      image: 'assets/poses/shoulder-roll.svg',
      focus: 'Ombros',
      tip: 'Evite elevar o peito; o movimento vem dos ombros.'
    },
    'hip-flexor': {
      id: 'hip-flexor',
      name: 'Flexor do quadril no afundo',
      description: 'Ajoelhe-se em posição de afundo, com o pé direito à frente e o joelho esquerdo apoiado no chão. Leve o quadril suavemente para frente, mantendo a coluna ereta e o abdômen levemente contraído. Não deixe a lombar arquear e troque de lado na metade do tempo.',
      duration: 50,
      image: 'assets/poses/hip-flexor.svg',
      focus: 'Quadril',
      tip: 'Contraia levemente o glúteo de trás para proteger a lombar.'
    },
    'hamstring-stand': {
      id: 'hamstring-stand',
      name: 'Isquiotibiais em pé',
      description: 'Em pé, com os pés na largura do quadril, dobre os joelhos e desça o tronco em direção às pernas, deixando a cabeça e os braços pesarem em direção ao chão. Relaxe o pescoço e respire fundo, sem buscar tocar os pés. A dobra vem da articulação do quadril.',
      duration: 45,
      image: 'assets/poses/hamstring-stand.svg',
      focus: 'Pernas',
      tip: 'Dobre os joelhos o quanto precisar; não force a coluna.'
    },
    squat: {
      id: 'squat',
      name: 'Agachamento profundo',
      description: 'Afaste os pés um pouco além da largura do quadril e agache profundamente, levando o quadril para trás e para baixo. Mantenha os calcanhares no chão, o peito aberto e as mãos à frente para equilibrar. Fique no limite confortável e respire devagar.',
      duration: 45,
      image: 'assets/poses/squat.svg',
      focus: 'Quadril',
      tip: 'Se os calcanhares saírem do chão, afaste mais os pés ou use um apoio.'
    },
    neck: {
      id: 'neck',
      name: 'Pescoço de um lado ao outro',
      description: 'Sentado ou em pé, com os ombros baixos e relaxados, incline lentamente a cabeça para a direita, aproximando a orelha do ombro. Use a mão direita para aumentar levemente a tração, sem puxar com força. Troque de lado na metade do tempo e mantenha o ombro oposto longe da orelha.',
      duration: 40,
      image: 'assets/poses/neck.svg',
      focus: 'Pescoço',
      tip: 'A força vem do peso da mão, nunca de um puxão.'
    },
    'shoulder-cross': {
      id: 'shoulder-cross',
      name: 'Ombro cruzado',
      description: 'Passe o braço direito estendido por cima do peito, na altura do ombro. Com a mão esquerda apoiada no cotovelo direito, puxe o braço suavemente em direção ao corpo, mantendo o ombro direito baixo e relaxado. Troque de lado na metade do tempo.',
      duration: 40,
      image: 'assets/poses/shoulder-cross.svg',
      focus: 'Ombros',
      tip: 'Mantenha o ombro alongado longe da orelha.'
    },
    'chest-wall': {
      id: 'chest-wall',
      name: 'Abertura de peito na parede',
      description: 'Fique de lado para uma parede e apoie o antebraço nela, com o cotovelo na altura do ombro. Gire o tronco suavemente para longe da parede até sentir o peito abrir. Mantenha as costelas baixas e o abdômen ativo, trocando de lado na metade do tempo.',
      duration: 45,
      image: 'assets/poses/chest-wall.svg',
      focus: 'Peito',
      tip: 'Não deixe as costelas estufarem; mantenha o abdômen ativo.'
    },
    'seated-twist': {
      id: 'seated-twist',
      name: 'Torção sentada',
      description: 'Sente-se com as pernas cruzadas e a coluna ereta. Gire o tronco para a direita, apoiando a mão direita atrás do corpo e a mão esquerda sobre o joelho oposto. Alongue a coluna a cada inspiração e gire um pouco mais na expiração. Troque de lado na metade do tempo.',
      duration: 45,
      image: 'assets/poses/seated-twist.svg',
      focus: 'Coluna',
      tip: 'Cresça a coluna antes de girar; não force o pescoço.'
    },
    butterfly: {
      id: 'butterfly',
      name: 'Borboleta',
      description: 'Sentado, una as solas dos pés à frente do corpo e aproxime os calcanhares do quadril. Segure os pés, mantenha a coluna longa e deixe os joelhos descerem naturalmente, sem empurrar com força. Você pode inclinar o tronco levemente à frente para aprofundar.',
      duration: 60,
      image: 'assets/poses/butterfly.svg',
      focus: 'Quadril',
      tip: 'Apoie os joelhos em almofadas se a virilha estiver sensível.'
    },
    'knee-chest': {
      id: 'knee-chest',
      name: 'Joelho ao peito',
      description: 'Deite-se de costas e traga um joelho em direção ao peito, segurando-o com as mãos. Mantenha a lombar apoiada no chão e o outro pé descansando no chão ou estendido. Troque de perna na metade do tempo, respirando fundo a cada abraço.',
      duration: 45,
      image: 'assets/poses/knee-chest.svg',
      focus: 'Lombar',
      tip: 'Respire fundo e solte o ar devagar a cada abraço.'
    },
    'leg-swing': {
      id: 'leg-swing',
      name: 'Balanço de pernas',
      description: 'Fique em pé ao lado de um apoio, com a mão apoiada nele para equilíbrio. Balançe a perna de fora para frente e para trás, de forma controlada, aumentando a amplitude aos poucos. Faça metade do tempo com cada perna, mantendo o tronco estável.',
      duration: 45,
      image: 'assets/poses/leg-swing.svg',
      focus: 'Quadril',
      tip: 'O movimento nasce do quadril, não da lombar.'
    },
    'hip-circle': {
      id: 'hip-circle',
      name: 'Círculos de quadril',
      description: 'Em pé, com os pés na largura do quadril e as mãos na cintura, desenhe círculos amplos com o quadril. Passe pela frente, pela lateral, por trás e pela outra lateral, mantendo os joelhos levemente flexionados. Faça círculos em um sentido e depois no outro.',
      duration: 45,
      image: 'assets/poses/hip-circle.svg',
      focus: 'Quadril',
      tip: 'Faça círculos suaves e mantenha a respiração fluida.'
    },
    'lunge-twist': {
      id: 'lunge-twist',
      name: 'Afundo com rotação',
      description: 'Dê um passo à frente e desça em um afundo, com os dois joelhos a noventa graus. Apoie a mão oposta no chão ao lado do pé da frente e abra o outro braço para o teto, girando o tronco. Troque de lado na metade do tempo, mantendo o quadril estável.',
      duration: 50,
      image: 'assets/poses/lunge-twist.svg',
      focus: 'Quadril',
      tip: 'Apoie o joelho de trás em uma almofada se precisar.'
    },
    'downward-dog': {
      id: 'downward-dog',
      name: 'Cachorro olhando para baixo',
      description: 'Comece em quatro apoios e eleve o quadril, formando um V invertido com o corpo. Espalhe os dedos das mãos, empurre o chão e leve o peito em direção às coxas; os joelhos podem ficar levemente flexionados. Relaxe a cabeça entre os braços e respire profundamente.',
      duration: 60,
      image: 'assets/poses/downward-dog.svg',
      focus: 'Corpo inteiro',
      tip: 'Afaste bem os dedos e pressione as mãos contra o chão.'
    },
    'calf-wall': {
      id: 'calf-wall',
      name: 'Panturrilha na parede',
      description: 'Apoie as mãos na parede e leve uma perna para trás, mantendo o calcanhar no chão e a perna esticada. Incline o corpo à frente até sentir a panturrilha alongar, sem deixar o pé de trás virar para fora. Troque de lado na metade do tempo.',
      duration: 45,
      image: 'assets/poses/calf-wall.svg',
      focus: 'Panturrilhas',
      tip: 'Mantenha o pé de trás apontado para a frente, sem virar o calcanhar.'
    },
    'quad-stand': {
      id: 'quad-stand',
      name: 'Quadríceps em pé',
      description: 'Em pé, apoie-se em algo firme e dobre um joelho, levando o pé em direção ao glúteo. Segure o tornozelo com a mão do mesmo lado e aproxime o calcanhar do corpo, mantendo os joelhos próximos e o quadril alinhado. Troque de lado na metade do tempo.',
      duration: 45,
      image: 'assets/poses/quad-stand.svg',
      focus: 'Coxas',
      tip: 'Mantenha os joelhos alinhados e o quadril voltado para frente.'
    },
    'hamstring-seated': {
      id: 'hamstring-seated',
      name: 'Isquiotibiais sentado',
      description: 'Sente-se com uma perna estendida à frente e a outra flexionada. Mantenha a coluna longa e incline o tronco a partir do quadril em direção à perna esticada, levando as mãos ao pé ou ao tornozelo sem arredondar as costas. Troque de lado na metade do tempo.',
      duration: 50,
      image: 'assets/poses/hamstring-seated.svg',
      focus: 'Pernas',
      tip: 'Incline a partir do quadril; a coluna permanece longa.'
    },
    pigeon: {
      id: 'pigeon',
      name: 'Postura do pombo',
      description: 'A partir de quatro apoios, traga o joelho direito à frente, apoiando o pé no chão na diagonal, e estenda a perna esquerda para trás. Mantenha o quadril nivelado e o peito aberto; desça o tronco sobre a perna da frente se for confortável. Troque de lado na metade do tempo.',
      duration: 60,
      image: 'assets/poses/pigeon.svg',
      focus: 'Quadril',
      tip: 'Se o joelho da frente reclamar, aproxime o pé do corpo.'
    },
    'supine-twist': {
      id: 'supine-twist',
      name: 'Torção deitada',
      description: 'Deite-se de costas, abra os braços em cruz e dobre os joelhos. Deixe as pernas caírem para a direita enquanto os ombros permanecem no chão, olhando para o lado oposto. Respire fundo e troque de lado na metade do tempo, sem forçar o pescoço.',
      duration: 50,
      image: 'assets/poses/supine-twist.svg',
      focus: 'Coluna',
      tip: 'Deixe os ombros pesarem no chão e respire fundo.'
    },
    'child-pose': {
      id: 'child-pose',
      name: 'Postura da criança',
      description: 'Ajoelhe-se com os joelhos afastados e os dedos dos pés juntos. Leve o quadril em direção aos calcanhares e estenda os braços à frente, apoiando a testa no chão. Respire profundamente e relaxe os ombros; ative levemente o abdômen se sentir a lombar.',
      duration: 60,
      image: 'assets/poses/child-pose.svg',
      focus: 'Costas',
      tip: 'Afaste os joelhos para dar espaço ao abdômen.'
    },
    bridge: {
      id: 'bridge',
      name: 'Ponte',
      description: 'Deite-se de costas com os joelhos dobrados e os pés paralelos, na largura do quadril. Pressione os pés no chão e eleve o quadril, formando uma linha do ombro ao joelho. Mantenha as costelas baixas e não comprima o pescoço; desça devagar e repita no seu ritmo.',
      duration: 45,
      image: 'assets/poses/bridge.svg',
      focus: 'Lombar',
      tip: 'Suba até onde a lombar ficar confortável; não force o pescoço.'
    },
    warrior: {
      id: 'warrior',
      name: 'Guerreiro II',
      description: 'Afaste as pernas, gire o pé direito para fora e o esquerdo levemente para dentro. Dobre o joelho direito até que fique sobre o tornozelo e abra os braços na altura dos ombros, olhando para a mão da frente. Troque de lado na metade do tempo, mantendo o tronco ereto.',
      duration: 50,
      image: 'assets/poses/warrior.svg',
      focus: 'Pernas',
      tip: 'O joelho da frente acompanha o segundo dedo do pé.'
    },
    triangle: {
      id: 'triangle',
      name: 'Triângulo',
      description: 'Com as pernas afastadas, gire o pé direito para fora e estenda os braços em cruz. Incline o tronco para a direita e desça a mão até a canela ou o tornozelo, mantendo os dois lados do tronco longos. O braço esquerdo aponta para o teto. Troque de lado na metade do tempo.',
      duration: 45,
      image: 'assets/poses/triangle.svg',
      focus: 'Lateral do corpo',
      tip: 'Mantenha os dois lados do tronco longos, sem colapsar o peito.'
    },
    'legs-up-wall': {
      id: 'legs-up-wall',
      name: 'Pernas na parede',
      description: 'Deite-se de costas ao lado de uma parede e eleve as pernas, apoiando-as na superfície. Aproxime o quadril da parede conforme for confortável, deixe os braços ao lado do corpo e relaxe os ombros. Feche os olhos e respire devagar.',
      duration: 60,
      image: 'assets/poses/legs-up-wall.svg',
      focus: 'Relaxamento',
      tip: 'Se sentir formigamento, dobre levemente os joelhos ou saia da pose.'
    },
    savasana: {
      id: 'savasana',
      name: 'Relaxamento final',
      description: 'Deite-se de costas, com as pernas levemente afastadas e os braços ao lado do corpo, palmas para cima. Feche os olhos, solte a mandíbula e permita que o peso do corpo seja sustentado pelo chão. Acompanhe a respiração sem tentar controlá-la.',
      duration: 60,
      image: 'assets/poses/savasana.svg',
      focus: 'Relaxamento',
      tip: 'Não há pressa: deixe o corpo ser sustentado pelo chão.'
    },
    'reclined-butterfly': {
      id: 'reclined-butterfly',
      name: 'Borboleta deitada',
      description: 'Deite-se de costas e una as solas dos pés, deixando os joelhos caírem para os lados. Apoie as mãos no abdômen ou ao lado do corpo e mantenha os ombros relaxados. Se a lombar reclamar, coloque uma almofada sob os joelhos.',
      duration: 60,
      image: 'assets/poses/reclined-butterfly.svg',
      focus: 'Quadril',
      tip: 'Apoie os joelhos em almofadas para relaxar a lombar.'
    },
    cobra: {
      id: 'cobra',
      name: 'Cobra suave',
      description: 'Deite-se de bruços com as mãos ao lado do peito e as pernas estendidas. Pressione o chão com as mãos e eleve suavemente o peito, mantendo o quadril e as pernas apoiados. Os cotovelos ficam levemente flexionados; olhe para frente e alongue a coluna em vez de comprimir a lombar.',
      duration: 40,
      image: 'assets/poses/cobra.svg',
      focus: 'Coluna',
      tip: 'O movimento vem da extensão da coluna; os ombros ficam longe das orelhas.'
    }
  };

  const routines = [
    {
      id: 'despertar-matinal',
      title: 'Despertar Matinal',
      tagline: 'Acorde o corpo com leveza',
      description: 'Uma sequência curta para soltar as articulações, ativar a circulação e começar o dia com disposição.',
      category: 'Manhã',
      level: 'Leve',
      icon: 'sunrise',
      accent: '#2563eb',
      soft: '#eaf2ff',
      exerciseIds: ['breathing', 'cat-cow', 'side-bend', 'shoulder-roll', 'hip-flexor', 'hamstring-stand', 'squat'],
      tip: 'Comece sem pressa. Se acordou com o corpo rígido, diminua a amplitude e priorize a respiração.'
    },
    {
      id: 'pos-banho',
      title: 'Pós-Banho',
      tagline: 'Relaxe com o corpo quentinho',
      description: 'O calor do banho deixa os músculos mais receptivos. Aproveite para alongar ombros, peito e quadril.',
      category: 'Recuperação',
      level: 'Leve',
      icon: 'droplet',
      accent: '#0ea5e9',
      soft: '#e6f8fe',
      exerciseIds: ['neck', 'shoulder-cross', 'chest-wall', 'seated-twist', 'butterfly', 'knee-chest'],
      tip: 'Aproveite o calor do banho: os músculos estão mais maleáveis. Mantenha cada posição sem forçar.'
    },
    {
      id: 'pre-corrida',
      title: 'Pré-Corrida',
      tagline: 'Prepare cada passada',
      description: 'Movimentos dinâmicos para aquecer articulações, ativar o core e reduzir o risco de lesões antes de correr.',
      category: 'Corrida',
      level: 'Moderado',
      icon: 'activity',
      accent: '#4f46e5',
      soft: '#eef0ff',
      exerciseIds: ['breathing', 'leg-swing', 'hip-circle', 'lunge-twist', 'downward-dog', 'calf-wall', 'squat'],
      tip: 'Aqueça com movimento. Aumente a amplitude aos poucos e termine sentindo o corpo pronto para correr.'
    },
    {
      id: 'pos-corrida',
      title: 'Pós-Corrida',
      tagline: 'Recupere melhor, corra mais',
      description: 'Baixe o ritmo, solte panturrilhas, quadríceps e quadril e ajude o corpo a se recuperar depois do treino.',
      category: 'Corrida',
      level: 'Moderado',
      icon: 'heart',
      accent: '#0284c7',
      soft: '#e5f5fc',
      exerciseIds: ['quad-stand', 'hamstring-seated', 'calf-wall', 'hip-flexor', 'pigeon', 'supine-twist', 'savasana'],
      tip: 'Espere a respiração desacelerar antes de alongar. Se houver dor aguda, pare e procure orientação.'
    },
    {
      id: 'alivio-lombar',
      title: 'Alívio de Lombar',
      tagline: 'Menos tensão, mais mobilidade',
      description: 'Uma sequência suave de mobilidade e relaxamento para aliviar a tensão na lombar e no quadril.',
      category: 'Recuperação',
      level: 'Leve',
      icon: 'leaf',
      accent: '#0d9488',
      soft: '#e7faf7',
      exerciseIds: ['cat-cow', 'knee-chest', 'supine-twist', 'child-pose', 'bridge', 'pigeon', 'cobra'],
      tip: 'Respire para dentro das costelas e evite movimentos bruscos. A lombar gosta de calma e apoio.'
    },
    {
      id: 'corpo-inteiro',
      title: 'Corpo Inteiro',
      tagline: 'Alongue da cabeça aos pés',
      description: 'Uma prática completa que percorre grandes cadeias musculares para ganhar amplitude, presença e mobilidade.',
      category: 'Completo',
      level: 'Moderado',
      icon: 'sparkles',
      accent: '#3b82f6',
      soft: '#eaf3ff',
      exerciseIds: ['downward-dog', 'warrior', 'triangle', 'pigeon', 'bridge', 'butterfly', 'seated-twist', 'child-pose'],
      tip: 'Esta é uma prática mais longa. Ajuste cada pose ao seu limite e descanse entre os lados quando precisar.'
    },
    {
      id: 'preparacao-sono',
      title: 'Preparação para o Sono',
      tagline: 'Desacelere e durma melhor',
      description: 'Poses restaurativas e respiração lenta para acalmar o sistema nervoso e preparar o corpo para o descanso.',
      category: 'Noite',
      level: 'Leve',
      icon: 'moon',
      accent: '#4338ca',
      soft: '#eeecff',
      exerciseIds: ['breathing', 'reclined-butterfly', 'knee-chest', 'supine-twist', 'legs-up-wall', 'child-pose', 'savasana'],
      tip: 'Diminua as luzes, feche os olhos nas pausas e deixe a respiração ficar cada vez mais lenta.'
    }
  ];

  const levels = [
    {
      name: 'Iniciante',
      min: 0,
      color: '#0ea5e9',
      icon: 'leaf',
      blurb: 'Toda grande mudança começa com o primeiro alongamento.'
    },
    {
      name: 'Flexível',
      min: 75,
      color: '#2563eb',
      icon: 'activity',
      blurb: 'Você está criando consistência. O corpo já sente a diferença.'
    },
    {
      name: 'Avançado',
      min: 200,
      color: '#4f46e5',
      icon: 'bolt',
      blurb: 'Sua amplitude e disciplina estão crescendo juntas.'
    },
    {
      name: 'Mestre',
      min: 450,
      color: '#7c3aed',
      icon: 'medal',
      blurb: 'Movimento, respiração e constância em harmonia.'
    },
    {
      name: 'Lenda',
      min: 900,
      color: '#9333ea',
      icon: 'crown',
      blurb: 'Você transformou o alongamento em parte de quem você é.'
    }
  ];

  const tips = [
    'A constância vence a intensidade. Dez minutos hoje valem mais que uma hora no mês que vem.',
    'Nunca force um alongamento até a dor. Você deve sentir tensão, não pontadas.',
    'Respire devagar durante as poses. O corpo relaxa quando a respiração desacelera.',
    'Se passar muito tempo sentado, faça uma pausa de dois minutos a cada hora.',
    'Alongar depois do banho quente pode aumentar a sensação de relaxamento.',
    'Durma bem: a recuperação muscular também acontece enquanto você descansa.',
    'Compare seu progresso com você mesmo, nunca com outra pessoa.'
  ];

  window.BEND_DATA = {
    stretches: stretches,
    routines: routines,
    levels: levels,
    tips: tips,
    dailyGoalMinutes: 10
  };
})();
