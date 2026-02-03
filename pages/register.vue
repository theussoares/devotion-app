<template>
  <div class="flex justify-center items-center min-h-dvh bg-base-200 p-4">
    <div class="card w-full max-w-sm shadow-2xl bg-base-100">
        <form class="card-body" @submit.prevent="handleSubmitRegister">
        <h2 class="card-title justify-center text-2xl font-bold mb-4">Criar Conta</h2>
        
        <div class="space-y-4">
          <AppInput
            name="fullName"
            type="text"
            placeholder="Nome Completo"
            icon="lucide:user"
          />
  
          <AppInput
            name="username"
            type="text"
            placeholder="@usuario"
            icon="lucide:at-sign"
            @blur="formatUsername"
          />
  
          <div class="grid grid-cols-2 gap-4">
             <div class="form-control">
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content/50">
                    <Icon name="lucide:map-pin" class="w-5 h-5" />
                  </span>
                  <select 
                    class="select select-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors" 
                    @change="handleStateChange"
                  >
                    <option value="" disabled selected>Estado</option>
                    <option v-for="state in states" :key="state.id" :value="state.id">
                        {{ state.sigla }}
                    </option>
                  </select>
                </div>
             </div>
 
             <div class="form-control">
                <select 
                  class="select select-bordered w-full bg-base-200 focus:bg-base-100 transition-colors" 
                  :disabled="!selectedState || loadingCities"
                  @change="handleCityChange"
                >
                    <option value="" disabled selected>Cidade</option>
                    <option v-for="city in cities" :key="city.id" :value="city.id">
                        {{ city.name }}
                    </option>
                </select>
             </div>
          </div>
          <label v-if="cityError" class="label pb-0 pt-1">
             <span class="label-text-alt text-error text-center w-full">{{ cityError }}</span>
          </label>
          <!-- Hidden inputs for validation -->
          <input type="hidden" :value="cityValue" />
          <input type="hidden" :value="cityIbgeId" />
  
          <AppInput
            name="email"
            type="email"
            placeholder="Email"
            icon="lucide:mail"
          />
  
          <AppInput
            name="password"
            type="password"
            placeholder="Senha (min. 6 caracteres)"
            icon="lucide:lock"
          />
        </div>

        <div v-if="errorMsg" class="alert alert-error text-sm mt-4">
          {{ errorMsg }}
        </div>

        <div class="form-control mt-6">
          <button class="btn btn-primary w-full disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner"></span>
            Cadastrar
          </button>
        </div>

        <AppCaptcha ref="captchaRef" @verify="token => captchaToken = token" />
        
        <div class="text-center text-sm mt-4">
          Já tem conta? <NuxtLink to="/login" class="link link-primary font-semibold">Entrar</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { registerSchema } from '~/schemas/auth'

const router = useRouter()
const { register } = useAuthService()
const { getStates, getCitiesByState } = useIbge()

// Form Setup
const { handleSubmit, errors, isSubmitting, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: {
    cityIbgeId: 0,
    city: ''
  }
})

// Specific fields we need to manually handle or watch
const { value: cityValue, errorMessage: cityError } = useField('city')
const { value: cityIbgeId } = useField('cityIbgeId')

// Local State for Dropdowns
const states = ref<any[]>([])
const cities = ref<any[]>([])
const selectedState = ref<number | null>(null)
const loadingCities = ref(false)

const errorMsg = ref('')
const captchaToken = ref('')
const captchaRef = ref()

onMounted(async () => {
    states.value = await getStates()
})

async function handleStateChange(event: any) {
    const ufId = event.target.value
    selectedState.value = ufId
    
    // Reset City
    setFieldValue('city', '')
    setFieldValue('cityIbgeId', 0)
    cities.value = []

    if (ufId) {
        loadingCities.value = true
        cities.value = await getCitiesByState(Number(ufId))
        loadingCities.value = false
    }
}

function handleCityChange(event: any) {
    const cityId = Number(event.target.value)
    const cityObj = cities.value.find(c => c.id === cityId)
    
    if (cityObj) {
        const stateObj = states.value.find(s => s.id == selectedState.value)
        const cityName = `${cityObj.name} - ${stateObj?.sigla}`
        setFieldValue('city', cityName)
        setFieldValue('cityIbgeId', cityId)
    }
}

function formatUsername() {
   const username = values.username as string | undefined
   if (username && !username.startsWith('@')) {
       setFieldValue('username', '@' + username)
   }
}

const handleSubmitRegister = handleSubmit(async (formValues) => {
  errorMsg.value = ''
  
  if (!captchaToken.value) {
      captchaRef.value?.forceCheck()
      errorMsg.value = 'Por favor, complete a verificação de segurança abaixo.'
      return
  }
  
  const { success, message } = await register({
      fullName: formValues.fullName,
      username: formValues.username, // Transformed by schema but safer to use formValues
      email: formValues.email,
      password: formValues.password,
      city: formValues.city,
      cityIbgeId: formValues.cityIbgeId,
      captchaToken: captchaToken.value
  })

  if (!success) {
      errorMsg.value = message || 'Erro ao registrar.'
      captchaRef.value?.reset()
      captchaToken.value = ''
      return
  }

  // Success - redirect to verify email page
  router.push({
    path: '/verify-email',
    query: { email: formValues.email }
  })
})
</script>
