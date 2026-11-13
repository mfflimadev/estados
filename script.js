/* ===========================================================
   Estados do Brasil — o JavaScript

   Organize o arquivo em quatro partes, como no projeto das
   cidades:

   1. Busca
   2. Dados
   3. Tela
   4. Eventos
   =========================================================== */
    let estados=[];
    let favoritos=[];
    const CHAVEF=[];
 async function buscarEstados(){
   const url= `https://servicodados.ibge.gov.br/api/v1/localidades/estados`
   
   try{
    let resposta= await fetch(url);
    let estados= resposta.json(); 
    return estados;
  }catch(erro){
   throw new Error('Não conseguimos acessar o banco de dados,recarregue a página ou tente mais tarde', {cause:erro})
}
}

async function buscarCidades(sigla){
   const url= `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios`
   
   try{
    let resposta= await fetch(url);
    let cidades= resposta.json(); 
    return cidades;

  }catch(erro){
   throw new Error('Falha no requerimento!')
}
}

 async function declararEstados(){
      estados=await buscarEstados();
      return estados;
   }

   const Status= document.querySelector('.status');
   const listaEstados= document.querySelector('.lista-de-estados')
   const campoBusca= document.querySelector('.campo-busca')
   const campoOrdem=document.querySelector('.campo-ordem');
   const botoesConteiner=document.querySelector('.regioes')
   const botaoRegiao= document.querySelectorAll('.botao-regiao');
   const botaoFavoritos=document.querySelector('.botao-favoritos');
  const botoesLista= document.querySelectorAll('.opcao-regiao')
 const conteinerOpcoes= document.querySelector('.tem-submenu')

   async function inicializarLista(){
   resetarTextoStatus();
   Status.textContent='Carregando os estados...'
 listaEstados.innerHTML='';
 for( let i=0; i<6;i++){
   const card=criarCardEsqueleto();
   listaEstados.appendChild(card);
 }
   try{
      await declararEstados()
     Status.textContent=`Chegaram ${estados.length} estados.`;
     renderizarLista(estados)
 }catch(erro){
     mostrarErro(erro.message);
 }
}


carregarFavoritos();
   inicializarLista();
  


   function salvarFavoritos(favorito){
    localStorage.setItem(CHAVEF,JSON.stringify(favorito));
}

function carregarFavoritos(){
    const salvas = localStorage.getItem(CHAVEF);
    if (salvas === null) {
        return [];
    }
    favoritos= JSON.parse(salvas);
   }

   function atualizarFavoritos(){
      const cards= listaEstados.querySelectorAll('.estado')
      cards.forEach(item=>{
         const botaoFavorito=item.querySelector('.botao-favorito')
         const sigla= item.querySelector('.estado-sigla')
         for( let i=0; i< favoritos.length;i++){ 
          if(sigla.textContent === favoritos[i]){
            botaoFavorito.classList.add('favorito')
             botaoFavorito.textContent='★';
           }}
   })

   }

    function mostrarMunicipios(elemento){
      elemento.textContent='Buscando...'
      
   };


   


function criarCard(estados){
   const card= document.createElement('li');
   const sigla= document.createElement('p');
   const nome= document.createElement('h2');
   const regiao= document.createElement('p');
   const municipio= document.createElement('p')
   const acoes= document.createElement('div');
   const botaoMunicipio= document.createElement('button');
   const botaoFavorito= document.createElement('button');

   card.classList.add('estado');
   card.dataset.regiao = estados.regiao.nome;
   sigla.classList.add('estado-sigla');
   nome.classList.add('estado-nome');
   regiao.classList.add('estado-regiao');
   municipio.classList.add('estado-municipios','buscando');
   acoes.classList.add('estado-acoes');
   botaoMunicipio.classList.add('botao-municipios');
   botaoFavorito.classList.add('botao-favorito');

   sigla.textContent= estados.sigla;
   nome.textContent= estados.nome;
   regiao.textContent= estados.regiao.nome;
   botaoMunicipio.textContent='Quantos municípios?';
   botaoFavorito.textContent='☆'; 

   botaoMunicipio.addEventListener('click',async function(){
        mostrarMunicipios(municipio);
       botaoMunicipio.disabled=true; 
      try{ 
      const municipios= await buscarCidades(estados.sigla);
      console.log(municipios)
      botaoMunicipio.disabled=false; 
      municipio.classList.remove('erro')
       municipio.textContent=`Chegaram ${municipios.length} municípios.`
   }catch(erro){
      municipio.classList.add('erro')
      municipio.textContent= erro.message;
   }finally{
       municipio.classList.remove('buscando')
   }
})
    

   botaoFavorito.addEventListener('click',function(){
      botaoFavorito.classList.toggle('favorito');
   
      if(botaoFavorito.classList.contains('favorito')){
         botaoFavorito.textContent='★';
         favoritos.push(sigla.textContent);
         salvarFavoritos(favoritos);
      }
      else{
         botaoFavorito.textContent='☆';
         favoritos= favoritos.filter(item=> item !== sigla.textContent)
         salvarFavoritos(favoritos);
      }
       
      console.log(favoritos);
   })
   
   card.appendChild(sigla);
   card.appendChild(nome);
   card.appendChild(regiao);
   card.appendChild(municipio);
   acoes.appendChild(botaoMunicipio);
   acoes.appendChild(botaoFavorito);
   card.appendChild(acoes);
   return card;
   }
   


   function resetarTextoStatus(){
      Status.textContent='';
      Status.classList.remove('erro');
   }
function criarCardEsqueleto(){
 const card= document.createElement('li');
   card.classList.add('estado-esqueleto');
   return card; 
}

async function contagemBotao(regiaoBotao,quantidade){
   const retorno= filtrarEstados( await buscarEstados()).filter(item=> item.regiao.nome=== regiaoBotao ||regiaoBotao === '' )
   quantidade.textContent= `(${retorno.length})`;
}
function atualizarContagens() {
  botaoRegiao.forEach(function (botao) {
    const quantidade = botao.querySelector('.quantidade');
    contagemBotao(botao.dataset.regiao, quantidade);
  });
}

function ordenarEstados(array){
   if(campoOrdem.value==='nome'){
   return array.toSorted((a,b)=> a.nome.localeCompare(b.nome)); 
   }
    if(campoOrdem.value==='nome-invertido'){
   return array.toSorted((a,b)=> b.nome.localeCompare(a.nome)); 
   }
   if(campoOrdem.value==='regiao'){
   return array.toSorted((a,b)=> a.regiao.id-b.regiao.id); 
   }
}



function filtrarEstados(array){
    
   const filtrados= array.filter(item=> item.nome.toLowerCase().includes(campoBusca.value.trim().toLowerCase()));
   const filtrados2= filtrados.filter(filtrado=>  filtrado.regiao.nome===botoesConteiner.dataset.regiao || botoesConteiner.dataset.regiao==='');
   return filtrarFavoritos(filtrados2)
}
   
function filtrarFavoritos(array){
   
  if (botaoFavoritos.classList.contains('ativo')) {
    return array.filter(item => favoritos.includes(item.sigla));
  }
  return array;
}



function renderizarLista(estados){
 
   Status.textContent=`Chegaram ${filtrarEstados(estados).length} estados`
   listaEstados.innerHTML='';
const filtrados= ordenarEstados(filtrarEstados(estados));
    

for( let i=0; i< filtrados.length;i++){   
   const card=criarCard(filtrados[i]);
   card.style.animationDelay= i * 0.1+'s' ;
   listaEstados.appendChild(card);
    }
    atualizarContagens();
    atualizarFavoritos();
}



function mostrarErro(mensagem){
  Status.classList.add('erro');
  Status.textContent=mensagem;
}




campoOrdem.addEventListener('change',function(){
   renderizarLista(estados);
})






botaoRegiao.forEach(function (botao) {
  botao.addEventListener('click', function () {
    selecionarRegiao(botao.dataset.regiao);
  });
});
 

function selecionarRegiao(regiao) {
  botaoRegiao.forEach(function (botao) {
    botao.classList.toggle('ativo', botao.dataset.regiao === regiao);
  });

  botoesConteiner.dataset.regiao = regiao;
  renderizarLista(estados);
}

campoBusca.addEventListener('input',function(){
   
   renderizarLista(estados)
});

botaoFavoritos.addEventListener('click',function(){
   botaoFavoritos.classList.toggle('ativo')
   renderizarLista(estados);
})


botoesLista.forEach(function (opcao) {
  opcao.addEventListener('click', function (evento) {
    evento.preventDefault();   // só necessário se a opção for um <a href>
    selecionarRegiao(opcao.dataset.regiao);
  });
});

