<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200 p-4">
    <div class="card w-full max-w-sm shadow-2xl bg-base-100">
      <form class="card-body" @submit.prevent="handleRegister">
        <h2 class="card-title justify-center text-2xl font-bold mb-4">Criar Conta</h2>
        
        <div class="form-control">
          <label class="label"><span class="label-text">Nome Completo</span></label>
          <input v-model="fullName" type="text" placeholder="Seu nome" class="input input-bordered" required />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Nome de Usuário (único)</span></label>
          <input v-model="username" type="text" placeholder="@usuario" class="input input-bordered" required />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Cidade</span></label>
          <input v-model="city" type="text" placeholder="Ex: São Paulo" class="input input-bordered" required />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Email</span></label>
          <input v-model="email" type="email" placeholder="email" class="input input-bordered" required />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Senha</span></label>
          <input v-model="password" type="password" placeholder="senha" class="input input-bordered" required minlength="6" />
        </div>

        <div v-if="errorMsg" class="alert alert-error text-sm mt-2">
          {{ errorMsg }}
        </div>

        <div class="form-control mt-6">
          <button class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            Cadastrar
          </button>
        </div>
        
        <div class="text-center text-sm mt-4">
          Já tem conta? <NuxtLink to="/login" class="link link-primary">Entrar</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const router = useRouter()

const fullName = ref('')
const username = ref('')
const city = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  loading.value = true
  errorMsg.value = ''

  // 1. Sign Up using Supabase Auth
  // We pass metadata so the trigger 'handle_new_user' can populate the profiles table
  const { data, error } = await client.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: fullName.value,
        username: username.value,
        city: city.value, // Although not in the trigger I showed earlier, I should update the trigger or update profile after?
        // Wait, the trigger I wrote ONLY takes full_name, avatar_url, username. 
        // I need to Update the profile for CITY after creation if the trigger misses it.
        // OR better, rely on metadata if I update the trigger? 
        // For now, I'll update the profile manually after signup to be safe, or assume trigger catches it if I fix it.
        // Actually, looking at `supabase_setup.md`, the trigger uses:
        // new.raw_user_meta_data->>'username'
        // new.raw_user_meta_data->>'full_name'
        // It DOES NOT map 'city'. 
      }
    }
  })

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    return
  }

  // 2. Post-Registration: Update City (since trigger didn't handle it)
  if (data.user) {
    const { error: updateError } = await client
      .from('profiles')
      .update({ city: city.value })
      .eq('id', data.user.id)
    
    if (updateError) {
      console.error('Error updating city:', updateError)
      // Non-critical, can continue
    }

    // Redirect
    router.push('/')
  }
}
</script>
