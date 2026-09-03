<template>
  <div class="w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <!-- Table Header -->
        <thead>
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="[
                'py-3.5 px-4 font-bold select-none',
                header.column.getCanSort() ? 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors' : '',
                header.column.columnDef.meta?.headerClass || ''
              ]"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex items-center gap-1.5" :class="header.column.columnDef.meta?.align === 'right' ? 'justify-end' : header.column.columnDef.meta?.align === 'center' ? 'justify-center' : 'justify-start'">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <span v-if="header.column.getIsSorted()" class="text-xs text-[#831843] dark:text-rose-400">
                  {{ header.column.getIsSorted() === 'asc' ? '▲' : '▼' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="table.getAllLeafColumns().length" class="py-12 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-3">
                <span class="w-6 h-6 border-2 border-[#831843]/20 border-t-[#831843] rounded-full animate-spin"></span>
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Memuat data dari server...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="table.getRowModel().rows.length === 0">
            <td :colspan="table.getAllLeafColumns().length" class="py-12 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  📦
                </div>
                <p class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ emptyText }}</p>
                <p class="text-[11px] text-slate-400">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-else
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="[
                'py-3 px-4',
                cell.column.columnDef.meta?.cellClass || '',
                cell.column.columnDef.meta?.align === 'right' ? 'text-right' : cell.column.columnDef.meta?.align === 'center' ? 'text-center' : 'text-left'
              ]"
            >
              <!-- Slot khusus per kolom jika disediakan oleh parent -->
              <slot
                :name="cell.column.id"
                :row="row.original"
                :value="cell.getValue()"
                :cell="cell"
              >
                <!-- Render bawaan TanStack -->
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  FlexRender
} from '@tanstack/vue-table'
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'Tidak ada data ditemukan'
  }
})

const sorting = ref([])

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get sorting() {
      return sorting.value
    }
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  manualPagination: true,
  manualFiltering: true
})
</script>
