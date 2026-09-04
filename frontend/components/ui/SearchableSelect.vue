<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Trigger Button -->
    <button
      type="button"
      :id="id"
      :disabled="disabled"
      @click="toggleOpen"
      class="w-full flex items-center justify-between text-xs font-semibold rounded-xl border px-3.5 py-2.5 transition-all text-left cursor-pointer focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
      :class="[
        isOpen ? ringBorderClass : defaultBorderClass,
        'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
      ]"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <div class="flex items-center gap-2 truncate pr-2 min-w-0">
        <!-- Optional Leading Icon Slot -->
        <slot name="icon" />

        <!-- Selected Content Slot or Default -->
        <slot name="selected" :option="selectedOption">
          <span v-if="selectedOption" class="truncate flex items-center gap-1.5">
            <span class="truncate">{{ getOptionLabel(selectedOption) }}</span>
            <span
              v-if="getOptionCode(selectedOption)"
              class="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0"
            >
              {{ getOptionCode(selectedOption) }}
            </span>
            <span
              v-if="getOptionSublabel(selectedOption)"
              class="text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate hidden sm:inline"
            >
              — {{ getOptionSublabel(selectedOption) }}
            </span>
          </span>
          <span v-else class="text-slate-400 dark:text-slate-500 font-normal truncate">
            {{ placeholder }}
          </span>
        </slot>
      </div>

      <div class="flex items-center gap-1.5 flex-shrink-0">
        <!-- Clear button if selected, clearable, and not disabled -->
        <button
          v-if="clearable && selectedOption && getOptionValue(selectedOption) !== null && !disabled"
          type="button"
          @click.stop="clearSelection"
          class="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Hapus Pilihan"
          aria-label="Hapus Pilihan"
        >
          <X class="w-3.5 h-3.5" />
        </button>
        <ChevronDown
          class="w-4 h-4 text-slate-400 transition-transform duration-200"
          :class="[
            isOpen ? 'rotate-180' : '',
            isOpen && variant === 'amber' ? 'text-amber-600 dark:text-amber-400' : '',
            isOpen && variant !== 'amber' ? 'text-[#831843] dark:text-[#f472b6]' : ''
          ]"
        />
      </div>
    </button>

    <!-- Dropdown Menu Popover -->
    <div
      v-if="isOpen"
      class="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-150"
    >
      <!-- Search Input Header -->
      <div class="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
        <div class="relative flex items-center">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            @keydown.esc.stop="close"
            class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-8 pr-7 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:border-transparent font-medium"
            :class="searchInputFocusClass"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Reset pencarian"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Options List -->
      <ul
        ref="listRef"
        class="overflow-y-auto p-1.5 space-y-0.5 focus:outline-hidden divide-y divide-slate-100/60 dark:divide-slate-800/60"
        :class="dropdownMaxHeight"
        role="listbox"
      >
        <!-- Empty State -->
        <li v-if="filteredOptions.length === 0" class="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          <SearchX class="w-6 h-6 mx-auto mb-1.5 opacity-40" />
          {{ emptyText }}
        </li>

        <!-- Option Items -->
        <li
          v-for="opt in filteredOptions"
          :key="String(getOptionValue(opt))"
          @click="selectOption(opt)"
          class="flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer transition-colors group"
          :class="[
            isSelected(opt) ? activeOptionClass : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium'
          ]"
          role="option"
          :aria-selected="isSelected(opt)"
        >
          <!-- Custom Option Slot or Default -->
          <slot name="option" :option="opt" :selected="isSelected(opt)">
            <div class="flex flex-col min-w-0 pr-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="truncate">{{ getOptionLabel(opt) }}</span>
                <span
                  v-if="getOptionCode(opt)"
                  class="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold"
                  :class="isSelected(opt) ? codeBadgeActiveClass : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
                >
                  {{ getOptionCode(opt) }}
                </span>
              </div>
              <span
                v-if="getOptionSublabel(opt)"
                class="text-[11px] truncate opacity-75 font-normal mt-0.5"
                :class="isSelected(opt) ? sublabelActiveClass : 'text-slate-400 dark:text-slate-500'"
              >
                {{ getOptionSublabel(opt) }}
              </span>
            </div>
          </slot>

          <Check
            v-if="isSelected(opt)"
            class="w-4 h-4 flex-shrink-0 ml-2"
            :class="checkIconClass"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Search, X, Check, SearchX } from 'lucide-vue-next'

const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
  modelValue: {
    type: [String, Number, Object, Boolean, null],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Pilih opsi...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Ketik untuk mencari...'
  },
  emptyText: {
    type: String,
    default: 'Tidak ada data ditemukan'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  sublabelKey: {
    type: String,
    default: 'sublabel'
  },
  codeKey: {
    type: String,
    default: 'code'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default' // 'default' | 'amber' | 'slate'
  },
  dropdownMaxHeight: {
    type: String,
    default: 'max-h-60'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref(null)
const searchInputRef = ref(null)
const listRef = ref(null)

// Helper methods to read option values safely whether object or primitive
const getOptionValue = (opt) => {
  if (opt === null || opt === undefined) return null
  if (typeof opt !== 'object') return opt
  return opt[props.valueKey] !== undefined ? opt[props.valueKey] : opt.id !== undefined ? opt.id : opt
}

const getOptionLabel = (opt) => {
  if (opt === null || opt === undefined) return ''
  if (typeof opt !== 'object') return String(opt)
  return opt[props.labelKey] !== undefined ? String(opt[props.labelKey]) : (opt.name || String(opt))
}

const getOptionSublabel = (opt) => {
  if (!opt || typeof opt !== 'object') return ''
  return opt[props.sublabelKey] || opt.description || ''
}

const getOptionCode = (opt) => {
  if (!opt || typeof opt !== 'object') return ''
  return opt[props.codeKey] || ''
}

// Find selected option
const selectedOption = computed(() => {
  return props.options.find(opt => getOptionValue(opt) === props.modelValue) || null
})

// Realtime search filtering
const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.options

  return props.options.filter(opt => {
    const label = getOptionLabel(opt).toLowerCase()
    const code = getOptionCode(opt).toLowerCase()
    const sublabel = getOptionSublabel(opt).toLowerCase()
    return label.includes(query) || code.includes(query) || sublabel.includes(query)
  })
})

const isSelected = (opt) => {
  return props.modelValue === getOptionValue(opt)
}

// Variant class bindings
const ringBorderClass = computed(() => {
  if (props.variant === 'amber') return 'ring-2 ring-amber-500 border-amber-500'
  return 'ring-2 ring-[#831843] border-[#831843]'
})

const defaultBorderClass = computed(() => {
  if (props.variant === 'amber') return 'border-amber-300 dark:border-amber-700 hover:border-amber-400'
  return 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
})

const searchInputFocusClass = computed(() => {
  if (props.variant === 'amber') return 'focus:ring-amber-500'
  return 'focus:ring-[#831843]'
})

const activeOptionClass = computed(() => {
  if (props.variant === 'amber') return 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold'
  return 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-bold'
})

const codeBadgeActiveClass = computed(() => {
  if (props.variant === 'amber') return 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
  return 'bg-[#831843]/20 text-[#831843] dark:text-[#f472b6]'
})

const sublabelActiveClass = computed(() => {
  if (props.variant === 'amber') return 'text-amber-800 dark:text-amber-300'
  return 'text-[#831843]/80 dark:text-[#f472b6]/80'
})

const checkIconClass = computed(() => {
  if (props.variant === 'amber') return 'text-amber-600 dark:text-amber-400'
  return 'text-[#831843] dark:text-[#f472b6]'
})

// Toggle & navigation actions
const toggleOpen = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const selectOption = (opt) => {
  const val = getOptionValue(opt)
  emit('update:modelValue', val)
  emit('change', val)
  close()
}

const clearSelection = () => {
  emit('update:modelValue', null)
  emit('change', null)
  close()
}

// Click outside handling
const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    close()
  }
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
