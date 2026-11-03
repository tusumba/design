/*
  TUSUMBA AUTH — FIGMA PLUGIN
  Creates 4 editable native Figma designs, local input/button components,
  and starter-safe color variables on ONE Figma page.
  No external images, plugins, network, or paid variables modes required.
*/
(async () => {
  try {
    const C = {
      primary: '#4757BE', deep: '#3546A9', mint: '#9AF0DD',
      mintDeep: '#18796F', white: '#FFFFFF', bg: '#F8F9FD',
      ink: '#20243A', sub: '#68718B', line: '#DEE2EF',
      lav: '#E1E6FF', pale: '#F1F3FF'
    };
    const toRGB = h => ({
      r: parseInt(h.slice(1, 3), 16) / 255,
      g: parseInt(h.slice(3, 5), 16) / 255,
      b: parseInt(h.slice(5, 7), 16) / 255
    });
    const paint = (role, opacity = 1) => ({
      type: 'SOLID', color: toRGB(C[role] || role), opacity
    });
    const fonts = {
      regular: { family: 'Inter', style: 'Regular' },
      medium: { family: 'Inter', style: 'Medium' },
      semibold: { family: 'Inter', style: 'Semi Bold' },
      bold: { family: 'Inter', style: 'Bold' }
    };
    // Some older machines may not have Inter locally. Figma normally provides it.
    try {
      await Promise.all(Object.values(fonts).map(f => figma.loadFontAsync(f)));
    } catch (e) {
      fonts.regular = { family: 'Roboto', style: 'Regular' };
      fonts.medium = { family: 'Roboto', style: 'Medium' };
      fonts.semibold = { family: 'Roboto', style: 'Medium' };
      fonts.bold = { family: 'Roboto', style: 'Bold' };
      await Promise.all(Object.values(fonts).map(f => figma.loadFontAsync(f)));
    }
    // Figma Starter supports one mode per local variable collection.
    // Do not call addMode().
    const collection = figma.variables.createVariableCollection('Tusumba Auth / Colors');
    const mode = collection.defaultModeId;
    collection.renameMode(mode, 'Light');
    const variables = {};
    for (const [name, hex] of Object.entries(C)) {
      const v = figma.variables.createVariable(name, collection, 'COLOR');
      v.scopes = ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR', 'TEXT_FILL'];
      v.setValueForMode(mode, { ...toRGB(hex), a: 1 });
      variables[name] = v;
    }
    const textSpecs = [
      ['Headline / Large', 38, 'bold', 48],
      ['Headline / Medium', 30, 'bold', 40],
      ['Title / Small', 17, 'semibold', 24],
      ['Body / Regular', 15, 'regular', 23],
      ['Body / Medium', 14, 'medium', 21],
      ['Caption', 12, 'regular', 18]
    ];
    for (const [name, size, weight, height] of textSpecs) {
      const s = figma.createTextStyle();
      s.name = 'Tusumba Auth / ' + name;
      s.fontName = fonts[weight];
      s.fontSize = size;
      s.lineHeight = { unit: 'PIXELS', value: height };
    }
    function createText(parent, value, x, y, width, size, weight = 'regular',
      role = 'ink', height = 0, name = 'Text') {
      const t = figma.createText();
      t.name = name;
      t.fontName = fonts[weight];
      t.fontSize = size;
      t.lineHeight = { unit: 'PIXELS', value: height || Math.round(size * 1.4) };
      t.characters = value;
      t.fills = [paint(role)];
      t.textAutoResize = 'HEIGHT';
      t.resize(width, 24);
      parent.appendChild(t);
      t.x = x;
      t.y = y;
      return t;
    }
    function createFrame(parent, name, x, y, width, height, role, radius = 0) {
      const f = figma.createFrame();
      f.name = name;
      parent.appendChild(f);
      f.x = x; f.y = y;
      f.resize(width, height);
      f.fills = role ? [paint(role)] : [];
      f.cornerRadius = radius;
      f.clipsContent = true;
      return f;
    }
    function createCircle(parent, name, x, y, width, height, role, opacity = 1) {
      const c = figma.createEllipse();
      c.name = name;
      parent.appendChild(c);
      c.x = x; c.y = y;
      c.resize(width, height);
      c.fills = [paint(role, opacity)];
      return c;
    }
    function createMasterInput(parent, x, y) {
      const master = figma.createComponent();
      master.name = 'Tusumba / Text Field / Default';
      parent.appendChild(master);
      master.x = x; master.y = y;
      master.resize(368, 82);
      master.layoutMode = 'VERTICAL';
      master.primaryAxisSizingMode = 'FIXED';
      master.counterAxisSizingMode = 'FIXED';
      master.itemSpacing = 9;
      master.fills = [];
      const label = createText(master, 'Электронная почта', 0, 0, 368, 13,
        'semibold', 'ink', 18, 'Field label');
      const area = figma.createFrame();
      area.name = 'Input surface';
      area.resize(368, 54);
      area.layoutMode = 'HORIZONTAL';
      area.primaryAxisSizingMode = 'FIXED';
      area.counterAxisSizingMode = 'FIXED';
      area.primaryAxisAlignItems = 'MIN';
      area.counterAxisAlignItems = 'CENTER';
      area.paddingLeft = 16;
      area.paddingRight = 16;
      area.fills = [paint('white')];
      area.strokes = [paint('line')];
      area.strokeWeight = 1;
      area.cornerRadius = 13;
      master.appendChild(area);
      createText(area, 'name@example.com', 0, 0, 330, 14,
        'regular', 'sub', 20, 'Field placeholder');
      return master;
    }
    function createMasterButton(parent, x, y, primary) {
      const master = figma.createComponent();
      master.name = primary ? 'Tusumba / Button / Primary' : 'Tusumba / Button / Outlined';
      parent.appendChild(master);
      master.x = x; master.y = y;
      master.resize(368, 54);
      master.layoutMode = 'HORIZONTAL';
      master.primaryAxisSizingMode = 'FIXED';
      master.counterAxisSizingMode = 'FIXED';
      master.primaryAxisAlignItems = 'CENTER';
      master.counterAxisAlignItems = 'CENTER';
      master.cornerRadius = 14;
      master.fills = [paint(primary ? 'primary' : 'white')];
      if (!primary) { master.strokes = [paint('line')]; master.strokeWeight = 1; }
      const label = createText(master, primary ? 'Продолжить' : 'Назад', 0, 0,
        320, 15, 'semibold', primary ? 'white' : 'ink', 21, 'Button label');
      label.textAlignHorizontal = 'CENTER';
      return master;
    }
    function field(parent, master, x, y, label, placeholder, password = false) {
      const i = master.createInstance();
      parent.appendChild(i);
      i.name = 'Field / ' + label;
      i.x = x; i.y = y;
      const labelNode = i.findOne(n => n.type === 'TEXT' && n.name === 'Field label');
      const phNode = i.findOne(n => n.type === 'TEXT' && n.name === 'Field placeholder');
      if (labelNode) labelNode.characters = label;
      if (phNode) phNode.characters = placeholder;
      if (password) createText(parent, 'Показать', x + 295, y + 46,
        71, 11, 'medium', 'primary', 15, 'Show password');
      return i;
    }
    function button(parent, master, x, y, label) {
      const i = master.createInstance();
      parent.appendChild(i);
      i.name = 'Button / ' + label;
      i.x = x; i.y = y;
      i.primaryAxisSizingMode = 'FIXED';
      i.resize(368, 54);
      const t = i.findOne(n => n.type === 'TEXT' && n.name === 'Button label');
      if (t) t.characters = label;
      return i;
    }
    function logo(parent, x, y, light = false) {
      const mark = createFrame(parent, 'Brand / Symbol', x, y, 39, 39,
        light ? 'white' : 'primary', 12);
      createCircle(mark, 'Mint spot', 8, 8, 17, 17, 'mint');
      createCircle(mark, 'Small spot', 23, 23, 8, 8, light ? 'deep' : 'white');
      createText(parent, 'tusumba', x + 50, y + 1, 175, 25,
        'bold', light ? 'white' : 'primary', 31, 'Brand / Wordmark');
    }
    function teaser(parent, x, y, kind) {
      const c = createFrame(parent, 'Event / Featured', x, y, 498, 167, 'white', 22);
      const icon = createFrame(c, 'Event / Icon', 22, 24, 76, 76,
        kind === 'login' ? 'lav' : 'pale', 18);
      createCircle(icon, 'Accent ring', 12, 14, 50, 50,
        kind === 'login' ? 'mint' : 'primary', 0.75);
      createCircle(icon, 'Dot', 28, 28, 18, 18, 'white', 0.9);
      createText(c, kind === 'login' ? 'Куда сходить в выходные?' : 'Найди компанию по интересам',
        119, 29, 345, 17, 'bold', 'ink', 24, 'Featured headline');
      createText(c, kind === 'login' ? 'Подборка событий рядом с тобой' : 'Секции, встречи и новые знакомства',
        119, 60, 345, 13, 'regular', 'sub', 19, 'Featured text');
      const tag = createFrame(c, 'Tag', 119, 101, 155, 33, 'pale', 16);
      createText(tag, kind === 'login' ? 'УЖЕ В ЭТУ СУББОТУ' : 'ДЛЯ ВСЕХ',
        13, 9, 140, 10, 'semibold', 'primary', 15, 'Category');
      createCircle(c, 'Decorative dot', 435, 125, 22, 22, 'mint');
    }
    function hero(parent, kind) {
      const h = createFrame(parent, 'Brand / Storytelling', 0, 0, 620, 940, 'primary');
      createCircle(h, 'Large halo', 398, -122, 365, 365, 'lav', 0.2);
      createCircle(h, 'Mint halo', 484, -14, 188, 188, 'mint', 0.8);
      createCircle(h, 'Inner halo', 535, 40, 83, 83, 'white', 0.16);
      createCircle(h, 'Bottom halo', -190, 710, 400, 400, 'mint', 0.09);
      logo(h, 50, 46, true);
      const kicker = createFrame(h, 'Kicker background', 51, 198, 245, 32, 'white', 16);
      kicker.opacity = 0.16;
      createText(h, 'ЖИВИ ЯРЧЕ КАЖДЫЙ ДЕНЬ', 64, 207, 325, 11,
        'bold', 'white', 15);
      createText(h, kind === 'login'
        ? 'Мир интересного\nсовсем рядом.'
        : 'Здесь начинаются\nновые истории.',
        50, 259, 525, 49, 'bold', 'white', 62, 'Hero / Headline');
      createText(h, kind === 'login'
        ? 'Ищи события и секции, находи друзей и открывай новые увлечения вместе с Tusumba.'
        : 'Создай аккаунт, чтобы сохранять любимые мероприятия, записываться на занятия и встречаться с друзьями.',
        53, 426, 474, 17, 'regular', 'white', 27, 'Hero / Description');
      teaser(h, 54, 619, kind);
      createText(h, 'TUSUMBA  /  СОБЫТИЯ И СЕКЦИИ', 54, 892, 440,
        12, 'medium', 'white', 18, 'Hero / Footer');
    }
    function desktop(kind, x, y, inputMaster, buttonMaster) {
      const isRegister = kind === 'register';
      const page = createFrame(figma.currentPage,
        isRegister ? 'Desktop / Регистрация' : 'Desktop / Вход',
        x, y, 1440, 940, 'bg', 24);
      hero(page, kind);
      const workspace = createFrame(page, 'Form / Workspace', 620, 0,
        820, 940, 'bg');
      createText(workspace, '←  К мероприятиям', 69, 59, 218, 13,
        'medium', 'sub', 18, 'Back to events');
      createText(workspace, isRegister ? 'Уже есть аккаунт?' : 'Ещё нет аккаунта?',
        506, 60, 179, 13, 'regular', 'sub', 18);
      createText(workspace, isRegister ? 'Войти' : 'Регистрация',
        675, 60, 138, 13, 'semibold', 'primary', 18);
      const xx = 218;
      createText(workspace, isRegister ? 'СОЗДАЙ ПРОФИЛЬ' : 'ДОБРО ПОЖАЛОВАТЬ',
        xx, isRegister ? 125 : 180, 370, 11, 'bold', 'mintDeep', 17, 'Eyebrow');
      createText(workspace, isRegister ? 'Присоединяйся!' : 'С возвращением!',
        xx, isRegister ? 156 : 214, 490, 38, 'bold', 'ink', 49, 'Page title');
      createText(workspace, isRegister ? 'Самое интересное начинается с одного шага.'
        : 'Войди, чтобы продолжить находить события\nи управлять своими записями.',
        xx, isRegister ? 221 : 278, 470, 15, 'regular', 'sub', 23);
      if (!isRegister) {
        field(workspace, inputMaster, xx, 358, 'Электронная почта', 'name@example.com');
        field(workspace, inputMaster, xx, 463, 'Пароль', 'Введите пароль', true);
        createText(workspace, 'Забыли пароль?', xx + 235, 557, 164, 13,
          'semibold', 'primary', 18, 'Forgot password');
        button(workspace, buttonMaster, xx, 611, 'Войти');
        createText(workspace, 'Нет профиля?', xx + 65, 698, 129, 14,
          'regular', 'sub', 21);
        createText(workspace, 'Создать аккаунт', xx + 169, 698, 175, 14,
          'semibold', 'primary', 21);
        createText(workspace, 'Вход защищён. Данные не передаются организаторам.',
          xx, 810, 470, 12, 'regular', 'sub', 18);
      } else {
        field(workspace, inputMaster, xx, 285, 'Имя и фамилия', 'Как к вам обращаться?');
        field(workspace, inputMaster, xx, 376, 'Электронная почта', 'name@example.com');
        field(workspace, inputMaster, xx, 467, 'Пароль', 'Минимум 8 символов', true);
        field(workspace, inputMaster, xx, 558, 'Повторите пароль', 'Введите пароль ещё раз', true);
        const check = createFrame(workspace, 'Checkbox / Unchecked', xx, 670, 20, 20, 'white', 5);
        check.strokes = [paint('sub')]; check.strokeWeight = 1.5;
        createText(workspace, 'Принимаю условия использования и политику\nконфиденциальности',
          xx + 30, 666, 381, 12, 'regular', 'sub', 18, 'Agreement');
        button(workspace, buttonMaster, xx, 724, 'Зарегистрироваться');
        createText(workspace, 'Уже есть аккаунт?', xx + 56, 813, 159, 14,
          'regular', 'sub', 21);
        createText(workspace, 'Войти', xx + 208, 813, 98, 14,
          'semibold', 'primary', 21);
      }
      createText(workspace, '© Tusumba   •   Политика конфиденциальности',
        xx, 887, 490, 11, 'regular', 'sub', 18, 'Footer');
      return page;
    }
    function mobile(kind, x, y, inputMaster, buttonMaster) {
      const isRegister = kind === 'register';
      const page = createFrame(figma.currentPage,
        isRegister ? 'Mobile / Регистрация' : 'Mobile / Вход',
        x, y, 412, 915, 'bg', 28);
      createCircle(page, 'Backdrop circle', 300, -170, 300, 300, 'lav', 0.38);
      createCircle(page, 'Backdrop mint', 360, -25, 80, 80, 'mint', 0.5);
      logo(page, 22, 31);
      createText(page, '←  На главную', 258, 41, 145, 12,
        'medium', 'sub', 17, 'Back home');
      createText(page, isRegister ? 'ДАВАЙ ЗНАКОМИТЬСЯ' : 'ДОБРО ПОЖАЛОВАТЬ',
        22, isRegister ? 123 : 138, 350, 11, 'bold', 'mintDeep', 16, 'Eyebrow');
      createText(page, isRegister ? 'Создай аккаунт' : 'С возвращением!',
        22, isRegister ? 151 : 171, 370, 31, 'bold', 'ink', 41, 'Page title');
      createText(page, isRegister
        ? 'Сохраняй мероприятия и записывайся\nна любимые занятия.'
        : 'Войди, чтобы снова быть в центре\nинтересных событий.',
        22, isRegister ? 201 : 223, 370, 14, 'regular', 'sub', 21, 'Subtitle');
      if (!isRegister) {
        field(page, inputMaster, 22, 303, 'Электронная почта', 'name@example.com');
        field(page, inputMaster, 22, 414, 'Пароль', 'Введите пароль', true);
        createText(page, 'Забыли пароль?', 258, 506, 150, 13,
          'semibold', 'primary', 18, 'Forgot password');
        button(page, buttonMaster, 22, 563, 'Войти');
        createText(page, 'Нет аккаунта?', 70, 650, 126, 14,
          'regular', 'sub', 19);
        createText(page, 'Зарегистрироваться', 187, 650, 210, 14,
          'semibold', 'primary', 19);
        const note = createFrame(page, 'Security note', 22, 735, 368, 95, 'pale', 18);
        createCircle(note, 'Note marker', 18, 20, 32, 32, 'mint');
        createText(note, 'Добро пожаловать обратно', 62, 18, 276, 13,
          'semibold', 'ink', 19);
        createText(note, 'Твои записи и избранные события будут\nдоступны после входа.',
          62, 42, 285, 12, 'regular', 'sub', 17);
      } else {
        field(page, inputMaster, 22, 254, 'Имя и фамилия', 'Как к вам обращаться?');
        field(page, inputMaster, 22, 346, 'Электронная почта', 'name@example.com');
        field(page, inputMaster, 22, 438, 'Пароль', 'Минимум 8 символов', true);
        field(page, inputMaster, 22, 530, 'Повторите пароль', 'Введите пароль ещё раз', true);
        const check = createFrame(page, 'Checkbox / Unchecked', 22, 639, 19, 19, 'white', 5);
        check.strokes = [paint('sub')]; check.strokeWeight = 1.5;
        createText(page, 'Принимаю условия использования и политику\nконфиденциальности',
          52, 634, 344, 12, 'regular', 'sub', 18, 'Agreement');
        button(page, buttonMaster, 22, 714, 'Зарегистрироваться');
        createText(page, 'Уже есть аккаунт?', 80, 796, 160, 14,
          'regular', 'sub', 20);
        createText(page, 'Войти', 234, 796, 90, 14,
          'semibold', 'primary', 20);
      }
      createText(page, '© Tusumba   •   Конфиденциальность',
        22, 867, 360, 11, 'regular', 'sub', 18, 'Footer');
      return page;
    }
    const page = figma.currentPage;
    let maxRight = 0;
    for (const node of page.children) maxRight = Math.max(maxRight, node.x + node.width);
    const baseX = page.children.length ? maxRight + 180 : 80;
    const heading = createText(page, 'TUSUMBA / АВТОРИЗАЦИЯ · DESKTOP + MOBILE',
      baseX, 25, 1340, 23, 'bold', 'primary', 34, 'Section title');
    const inputMaster = createMasterInput(page, baseX, 2250);
    const primaryMaster = createMasterButton(page, baseX + 420, 2250, true);
    const outlinedMaster = createMasterButton(page, baseX + 840, 2250, false);
    const screens = [
      desktop('login', baseX, 100, inputMaster, primaryMaster),
      desktop('register', baseX + 1600, 100, inputMaster, primaryMaster),
      mobile('login', baseX, 1190, inputMaster, primaryMaster),
      mobile('register', baseX + 490, 1190, inputMaster, primaryMaster)
    ];
    // Put label explaining master components without moving the frames.
    createText(page, 'КОМПОНЕНТЫ / используются экземплярами на всех экранах',
      baseX, 2200, 920, 17, 'bold', 'ink', 25, 'Components label');

    // Task #18899: additional editable wireframes, including all feedback states.
    // These pages use the same Tusumba token collection and type system as the auth screens.
    function wLabel(parent, value, x, y, width=360, size=14, weight='regular', role='ink') {
      return createText(parent,value,x,y,width,size,weight,role,Math.ceil(size*1.45),'Wireframe / Text');
    }
    function wBox(parent,name,x,y,width,height,role='pale',radius=12){
      const f=createFrame(parent,name,x,y,width,height,role,radius);
      return f;
    }
    function wChip(parent,label,x,y,active=false) {
      const c=wBox(parent,'Filter / '+label,x,y,Math.max(75,label.length*9+28),33,active?'lav':'white',16);
      c.strokes=[paint(active?'lav':'line')];c.strokeWeight=1;
      wLabel(c,label,12,7,c.width-19,11,'medium',active?'primary':'sub');return c;
    }
    const cardMaster=figma.createComponent();
    cardMaster.name='Tusumba / Wireframe / Listing card';
    figma.currentPage.appendChild(cardMaster);
    cardMaster.x=baseX+10300;cardMaster.y=2270;cardMaster.resize(292,262);
    cardMaster.fills=[paint('white')];cardMaster.cornerRadius=16;
    cardMaster.strokes=[paint('line')];cardMaster.strokeWeight=1;
    wBox(cardMaster,'Cover / Placeholder',0,0,292,108,'pale',12);
    wLabel(cardMaster,'▧  ИЗОБРАЖЕНИЕ',75,46,180,13,'medium','sub');
    wLabel(cardMaster,'Категория',14,120,200,11,'semibold','primary').name='Card category';
    wLabel(cardMaster,'Название события',14,144,250,17,'bold','ink').name='Card title';
    wLabel(cardMaster,'◷ Дата · 17:00',14,176,260,12,'regular','sub').name='Card time';
    wLabel(cardMaster,'⌖ Место проведения',14,194,260,12,'regular','sub').name='Card location';
    const detailBtn=wBox(cardMaster,'Action / Details',14,222,264,32,'pale',9);
    wLabel(detailBtn,'Подробнее →',92,6,165,12,'semibold','primary');
    function cardInstance(parent,x,y,category,title,when,place){
      const n=cardMaster.createInstance();parent.appendChild(n);n.x=x;n.y=y;
      n.name='Card / '+title;
      const updates={'Card category':category,'Card title':title,'Card time':'◷ '+when,'Card location':'⌖ '+place};
      n.findAll(q=>q.type==='TEXT').forEach(t=>{if(updates[t.name])t.characters=updates[t.name]});
      return n;
    }
    function nav(parent,width){
      const header=wBox(parent,'Navigation / Top',0,0,width,75,'white',0);
      const mark=wBox(header,'Logo / Mark',27,21,33,33,'primary',11);
      createCircle(mark,'Mint circle',8,8,15,15,'mint');
      wLabel(header,'tusumba',72,24,148,24,'bold','primary');
      if(width>800){wLabel(header,'Мероприятия',width-535,29,135,14,'semibold');wLabel(header,'Секции',width-384,29,100,14,'medium','sub');wLabel(header,'Друзья',width-254,29,95,14,'medium','sub');}
      else{wLabel(header,'Вход',width-77,30,60,13,'medium','primary');}
      return header;
    }
    function wireScreen(kind,x,y,mobile){
      const isDetail=kind==='event'||kind==='club',club=kind==='clubs'||kind==='club';
      const w=mobile?390:1440,h=mobile?844:900;
      const names={events:'Каталог мероприятий',event:'Страница мероприятия',clubs:'Каталог секций',club:'Страница секции'};
      const page=wBox(figma.currentPage,(mobile?'Mobile':'Desktop')+' / '+names[kind],x,y,w,h,'bg',20);
      nav(page,w);
      const X=mobile?23:76;
      if(!isDetail){
        wLabel(page,club?'Секции и кружки':'Куда пойдём?',X,115,mobile?345:850,mobile?29:42,'bold');
        wLabel(page,club?'Выбирай секцию по интересам и расписанию.':'Находи мероприятия рядом и планируй свободное время.',X,166,mobile?345:850,mobile?13:16,'regular','sub');
        const sr=wBox(page,'Search field',X,mobile?205:224,mobile?340:700,50,'white',13);
        sr.strokes=[paint('line')];sr.strokeWeight=1;
        wLabel(sr,club?'⌕ Поиск секций':'⌕ Название события или место',17,14,350,13,'regular','sub');
        const cats=club?['Все','Спорт','Творчество','Образование']:['Все','Музыка','Спорт','Встречи'];
        let cx=X;cats.forEach((c,i)=>{wChip(page,c,cx,mobile?274:294,i===0);cx+=Math.max(75,c.length*9+28)+9;});
        wLabel(page,club?'Популярные секции':'Ближайшие мероприятия',X,mobile?324:355,350,mobile?20:24,'bold');
        const names=club?[
          ['Творчество','Студия рисунка','Пн, Ср · 18:00','Дом творчества'],
          ['Спорт','Беговой клуб','Сб · 09:00','Городской парк'],
          ['Образование','Разговорный английский','Вт, Чт · 19:00','Молодёжный центр']]:[
          ['Встречи','Вечер настольных игр','14 ноября · 17:00','Молодёжный центр'],
          ['Музыка','Музыка под открытым небом','21 ноября · 18:00','Городской парк'],
          ['Творчество','Мастерская керамики','22 ноября · 12:00','Арт-пространство']];
        if(mobile){names.slice(0,2).forEach((a,i)=>cardInstance(page,40,366+i*280,...a));}
        else{names.forEach((a,i)=>cardInstance(page,76+i*322,422,...a));}
      }else{
        wLabel(page,club?'← К каталогу секций':'← К афише',X,101,300,14,'semibold','primary');
        const top=mobile?139:146;
        const cover=wBox(page,'Cover / Placeholder',X,top,mobile?344:790,mobile?180:296,'pale',17);
        wLabel(cover,'▧  МЕСТО ДЛЯ ФОТО',mobile?85:266,mobile?80:134,340,18,'medium','sub');
        const hx=mobile?X:76;
        wLabel(page,club?'Студия рисунка':'Вечер настольных игр',hx,mobile?343:472,mobile?330:790,mobile?27:35,'bold');
        wLabel(page,club?'Творчество · Для начинающих':'Встречи · Бесплатно',hx,mobile?384:528,mobile?340:400,14,'medium','primary');
        wLabel(page,'Описание',hx,mobile?431:594,250,20,'bold');
        wLabel(page,club?'Занятия для тех, кто хочет научиться рисовать и познакомиться с единомышленниками.':'Проводим вечер за настольными играми, общаемся и знакомимся. Можно прийти одному или с друзьями.',hx,mobile?468:628,mobile?335:720,mobile?13:15,'regular','sub');
        const info=wBox(page,'Participation / Information',mobile?23:935,mobile?561:147,mobile?344:418,mobile?345:365,'white',16);
        info.strokes=[paint('line')];info.strokeWeight=1;
        wLabel(info,club?'Запись на занятия':'Участие в мероприятии',18,22,mobile?300:380,mobile?16:20,'bold');
        wLabel(info,club?'◷ Пн, Ср · 18:00':'◷ 14 ноября · 17:00',18,69,300,14,'medium','sub');
        wLabel(info,club?'⌖ Дом творчества':'⌖ Молодёжный центр',18,106,350,14,'medium','sub');
        wLabel(info,club?'Цена: уточняется':'Стоимость: бесплатно',18,146,360,14,'semibold');
        const btn=wBox(info,'Action / '+(club?'Записаться':'Пойду'),18,mobile?215:230,mobile?308:382,52,'primary',13);
        wLabel(btn,club?'Записаться':'Пойду',mobile?95:151,17,200,15,'bold','white');
        wLabel(info,'Наличие мест нужно подтвердить',18,mobile?282:294,344,12,'regular','sub');
      }
      if(mobile){
        const bottom=wBox(page,'Mobile / Bottom navigation',0,h-66,w,66,'white',0);
        wLabel(bottom,'◉ Афиша',22,20,95,12,'medium','primary');
        wLabel(bottom,'▦ Секции',135,20,95,12,'medium','sub');
        wLabel(bottom,'♡ Друзья',254,20,95,12,'medium','sub');
      }
      return page;
    }
    const nameTop=createText(figma.currentPage,'#18899 / КАТАЛОГ · МЕРОПРИЯТИЕ · СЕКЦИИ · СОСТОЯНИЯ',baseX+3360,24,3200,26,'bold','primary',36,'Wireframes heading');
    const newScreens=[];
    ['events','event','clubs','club'].forEach((k,i)=>newScreens.push(wireScreen(k,baseX+3360+i*1530,100,false)));
    ['events','event','clubs','club'].forEach((k,i)=>newScreens.push(wireScreen(k,baseX+3360+i*495,1100,true)));
    // State matrix: one trio per each of six screens, including auth.
    createText(figma.currentPage,'СОСТОЯНИЯ / loading · empty · error для каждого экрана',baseX+3360,2130,1400,24,'bold','ink',36,'States heading');
    const stateLabels={events:'Каталог мероприятий',event:'Страница мероприятия',clubs:'Каталог секций',club:'Страница секции',login:'Вход',register:'Регистрация'};
    const states=['Загрузка','Пусто / нет данных','Ошибка'];
    const stateFrames=[];
    for(let j=0;j<6;j++){
      const k=Object.keys(stateLabels)[j];
      for(let si=0;si<3;si++){
        const x=baseX+3360+si*420, y=2240+j*330;
        const p=wBox(figma.currentPage,'STATE / '+stateLabels[k]+' / '+states[si],x,y,382,290,'white',16);
        p.strokes=[paint('line')];p.strokeWeight=1;
        wLabel(p,stateLabels[k],22,20,325,14,'bold','ink');
        wLabel(p,states[si],22,52,325,12,'semibold','primary');
        if(si===0){
          for(let n=0;n<3;n++)wBox(p,'Skeleton '+n,23,95+n*37,n===0?315:n===1?255:194,18,'pale',9);
          wLabel(p,'Загрузка данных…',23,226,315,12,'regular','sub');
        }else{
          const empty=si===1,auth=k==='login'||k==='register';
          wLabel(p,empty?'⌕':'!',23,98,60,38,'bold',empty?'sub':'primary');
          wLabel(p,empty?(auth?'Поля не заполнены':'Ничего не найдено'):'Не удалось загрузить',75,112,290,17,'bold');
          wLabel(p,empty?(auth?'Введите данные, чтобы продолжить.':'Попробуйте изменить фильтры.'): (auth?'Проверьте поля или повторите позже.':'Проверьте соединение и повторите.'),24,158,337,13,'regular','sub');
          const b=wBox(p,'State / action',24,214,330,44,si===2?'primary':'pale',10);
          wLabel(b,empty?(auth?'Заполнить форму':'Сбросить фильтры'):'Повторить',103,12,220,13,'semibold',si===2?'white':'primary');
        }
        stateFrames.push(p);
      }
    }
    screens.push(...newScreens, ...stateFrames);

    // Zoom to output and select the desktop login frame.
    figma.currentPage.selection = screens;
    figma.viewport.scrollAndZoomIntoView(screens);
    figma.notify('Готово: 12 основных экранов и 18 состояний #18899');
  } catch (err) {
    figma.notify('Ошибка создания макетов: ' + String(err), { timeout: 8000, error: true });
    console.error(err);
  } finally {
    figma.closePlugin();
  }
})();
