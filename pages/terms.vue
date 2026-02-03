<template>
  <div class="min-h-screen bg-black text-white px-4 py-8 pb-24">
    <div class="max-w-2xl mx-auto">
      <button @click="router.back()" class="btn btn-ghost btn-sm btn-circle mb-6 absolute top-4 left-4 lg:relative lg:top-0 lg:left-0">
        <Icon name="lucide:arrow-left" class="w-6 h-6" />
      </button>

      <h1 class="text-3xl font-bold mb-6 mt-10 lg:mt-0">Termos de Uso</h1>
      
      <div class="prose prose-invert prose-sm">
        <p><strong>Última atualização:</strong> {{ new Date().toLocaleDateString('pt-BR') }}</p>

        <h3>1. Aceitação dos Termos</h3>
        <p>Ao baixar, acessar ou usar o Devotion, você concorda em ficar vinculado a estes Termos de Uso. Se você não concordar, não use nosso aplicativo.</p>

        <h3>2. Uso do Serviço</h3>
        <p>O Devotion é uma plataforma para compartilhar devocionais e edificação mútua. Você concorda em usar o serviço apenas para fins legais e de acordo com nossas diretrizes da comunidade.</p>

        <h3>3. Conteúdo Gerado pelo Usuário (UGC)</h3>
        <p>Você é responsável pelo conteúdo que publica. É estritamente proibido:</p>
        <ul>
          <li>Conteúdo ofensivo, difamatório, calunioso ou ilegal.</li>
          <li>Discurso de ódio, violência ou discriminação.</li>
          <li>Nudez ou conteúdo sexualmente explícito.</li>
          <li>Spam ou publicidade não autorizada.</li>
        </ul>
        <p>Reservamo-nos o direito de remover qualquer conteúdo e banir usuários que violem estas regras, sem aviso prévio.</p>

        <h3>4. Moderação de Conteúdo</h3>
        <p>Utilizamos tecnologia de IA e revisão humana para monitorar o conteúdo. No entanto, não garantimos que todo conteúdo impróprio será detectado imediatamente.</p>

        <h3>5. Propriedade Intelectual</h3>
        <p>Você mantém os direitos sobre seu conteúdo, mas nos concede uma licença não exclusiva para exibi-lo no aplicativo.</p>

        <h3>6. Isenção de Garantias</h3>
        <p>O serviço é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros.</p>

        <h3>7. Contato</h3>
        <p>Para dúvidas, entre em contato conosco pelo e-mail de suporte.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
</script>
