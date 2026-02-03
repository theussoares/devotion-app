<template>
  <div class="min-h-screen bg-black text-white px-4 py-8 pb-24">
    <div class="max-w-2xl mx-auto">
      <button @click="router.back()" class="btn btn-ghost btn-sm btn-circle mb-6 absolute top-4 left-4 lg:relative lg:top-0 lg:left-0">
        <Icon name="lucide:arrow-left" class="w-6 h-6" />
      </button>

      <h1 class="text-3xl font-bold mb-6 mt-10 lg:mt-0">Política de Privacidade</h1>
      
      <div class="prose prose-invert prose-sm">
        <p><strong>Última atualização:</strong> {{ new Date().toLocaleDateString('pt-BR') }}</p>

        <h3>1. Introdução</h3>
        <p>O Devotion respeita sua privacidade. Esta política descreve como coletamos e usamos suas informações.</p>

        <h3>2. Dados Coletados</h3>
        <ul>
          <li><strong>Informações de Registro:</strong> Nome, e-mail, foto de perfil.</li>
          <li><strong>Conteúdo:</strong> Fotos e textos que você publica.</li>
          <li><strong>Uso:</strong> Logs de interação e device ID (para segurança).</li>
        </ul>

        <h3>3. Uso das Informações</h3>
        <p>Usamos seus dados para:</p>
        <ul>
          <li>Fornecer e manter o serviço.</li>
          <li>Personalizar sua experiência (feed, ranking).</li>
          <li>Garantir a segurança da comunidade.</li>
        </ul>

        <h3>4. Compartilhamento de Dados</h3>
        <p>Não vendemos seus dados pessoais. Podemos compartilhar dados com serviços de terceiros (como Supabase) essenciais para o funcionamento do app.</p>

        <h3>5. Segurança</h3>
        <p>Implementamos medidas de segurança para proteger seus dados, mas nenhum sistema é 100% seguro.</p>

        <h3>6. Seus Direitos</h3>
        <p>Você pode solicitar a exclusão da sua conta e dados a qualquer momento através das configurações do aplicativo.</p>

        <h3>7. Alterações</h3>
        <p>Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
</script>
