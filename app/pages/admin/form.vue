<script lang="ts" setup>
import { Edit, Trash2 } from 'lucide-vue-next'
import type { FormFull } from '~~/shared/types'
import { DangerousPopconfirm } from '#components'
import type { FormModel } from '~/components/form/model-editor.vue'
import { PermissionTypeText } from '~~/shared/consts'

definePageMeta({
  middleware: ['auth', 'admin'],
})

const { $api } = useNuxtApp()

const page = ref(1)
const totalPage = ref(1)
const cursor = ref<string | undefined>()

const forms = useLazyFetch('/api/forms', {
  $fetch: $api,
  query: cursor.value
    ? { cursor, pageSize: 10 }
    : { page: page.value, pageSize: 10 },
  keepalive: true,
})

const editingStructure = ref(false)
const editingStructureForm = ref<any>(undefined)
function handleEditStructure(row: FormFull) {
  editingStructure.value = true
  editingStructureForm.value = structuredClone(toRaw(row))
}

const editingModel = ref<FormModel | undefined>()
function handleEdit(row: FormFull) {
  editingModel.value = structuredClone(toRaw(row))
}

async function handleDelete(row: FormFull) {
  try {
    await $api(`/api/forms/${row.id}`, {
      method: 'DELETE',
    })
    forms.refresh()
  }
  catch (e) {
    alertApiError(e)
  }
}
</script>

<template>
  <FormFieldJsonEditor
    v-if="editingStructureForm"
    :id="editingStructureForm.id"
    v-model:visible="editingStructure"
    title="编辑表单结构"
    field="structure"
    :form="editingStructureForm"
    @submitted="forms.refresh()"
    @close="editingStructure = false"
  />

  <FormModelEditor
    v-if="editingModel"
    :form="editingModel"
    @submitted="forms.refresh()"
    @close="editingModel = undefined"
  />

  <ElTable
    v-loading="forms.status.value === 'pending'"
    :data="forms.data.value"
  >
    <ElTableColumn label="ID" :width="240" fixed #="{ row }">
      <CustomLink :href="`/form/${row.id}`" target="_blank">
        {{ row.id }}
      </CustomLink>
    </ElTableColumn>

    <ElTableColumn label="标题" #="{ row }">
      <OneLine>{{ row.title }}</OneLine>
    </ElTableColumn>
    <ElTableColumn label="表单结构" :width="110" #="{ row }">
      <ElButton size="small" @click="handleEditStructure(row)">
        查看／编辑
      </ElButton>
    </ElTableColumn>
    <ElTableColumn label="默认权限" :width="100" #="{ row }">
      {{ (PermissionTypeText as any)[row.basePermission] }}
    </ElTableColumn>

    <ElTableColumn v-slot="{ row }" label="操作" fixed="right">
      <ElButtonGroup size="small">
        <ElButton :icon="Edit" @click="handleEdit(row)" />
        <DangerousPopconfirm
          title="确认删除此表单？"
          :width="160"
          @confirm="handleDelete(row)"
        >
          <ElButton :icon="Trash2" />
        </DangerousPopconfirm>
      </ElButtonGroup>
    </ElTableColumn>
  </ElTable>

  <ElPagination
    v-model:current-page="page"
    hide-on-single-page
    :total="totalPage"
  />
</template>
