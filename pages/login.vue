<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold text-primary">Devocional</h1>
        <p class="py-6">Conecte-se, compartilhe e mantenha sua constância espiritual.</p>
      </div>
      <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form class="card-body" @submit.prevent="handleLogin">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input v-model="email" type="email" placeholder="email" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Senha</span>
            </label>
            <input v-model="password" type="password" placeholder="senha" class="input input-bordered" required />
            <label class="label">
              <a href="#" class="label-text-alt link link-hover">Esqueceu a senha?</a>
            </label>
          </div>
          <div v-if="errorMsg" class="alert alert-error text-sm py-1">
            {{ errorMsg }}
          </div>
          <div class="form-control mt-6">
            <button class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner"></span>
              Entrar
            </button>
          </div>
          <div class="divider">OU</div>
          <div class="text-center text-sm">
            Não tem conta? <NuxtLink to="/register" class="link link-primary">Cadastre-se</NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  
  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    errorMsg.value = error.message
    loading.value = false
  } else {
    // Auth state change will trigger watchEffect or middleware
    // router.push('/') gets handled by watch
  }
}
</script>
