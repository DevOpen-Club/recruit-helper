<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import type { FormFull } from '~~/shared/types'
import { PermissionTypeText } from '~~/shared/consts'

const props = defineProps<{
  form: FormFull
}>()
const emit = defineEmits<{
  close: []
  submitted: []
}>()

const { $api } = useNuxtApp()

const form = toRef(props, 'form')
const visible = ref(true)

const editingApprovalWidgets = ref(false)
function handleUpdatedApprovalWidgets(data: any) {
  form.value!.larkApprovalWidgets = data
}

const limitTicketPerUser = ref(form.value.maxTicketPerUser != null)
watch(limitTicketPerUser, (v) => {
  form.value.maxTicketPerUser = v ? 1 : null
})

const submitting = ref(false)
async function handleSubmit() {
  if (!form.value)
    return
  submitting.value = true
  try {
    await $api(`/api/forms/${form.value.id}`, {
      method: 'PATCH',
      body: form.value,
    })
    ElMessage.success('修改成功')
    visible.value = false
    emit('submitted')
  }
  catch (e) {
    alertApiError(e)
  }
  submitting.value = false
}
</script>

<template>
  <FormFieldJsonEditor
    :id="form.id"
    v-model:visible="editingApprovalWidgets"
    title="编辑表单到审批字段的映射"
    field="larkApprovalWidgets"
    :form="form"
    @submitted="handleUpdatedApprovalWidgets"
    @close="editingApprovalWidgets = undefined"
  />

  <ElDialog
    v-if="form"
    :form-value="visible"
    title="编辑表单信息"
    align-center
    @closed="$emit('close')"
  >
    <ElForm :form>
      <ElFormItem field="id" label="ID">
        <ElText>{{ form.id }}</ElText>
      </ElFormItem>

      <ElFormItem field="title" label="标题">
        <ElInput v-model="form.title" />
      </ElFormItem>

      <ElFormItem field="basePermission" label="默认权限">
        <ElSelect v-model="form.basePermission">
          <ElOption
            v-for="(label, value) in PermissionTypeText"
            :key="value"
            :label="label"
            :value="Number(value)"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem field="larkApprovalDefination" label="关联飞书审批 ID">
        <ElInput v-model="form.larkApprovalDefination" />
      </ElFormItem>

      <ElFormItem field="larkApprovalWidgets" label="审批字段映射">
        <ElButton @click="editingApprovalWidgets = true">
          查看／编辑
        </ElButton>
      </ElFormItem>

      <ElFormItem field="maxTicketPerUser" label="单用户提交次数上限">
        <ElSwitch v-model="limitTicketPerUser" style="margin-right: 12px;" />
        <ElInputNumber
          v-if="limitTicketPerUser"
          v-model="form.maxTicketPerUser"
          :min="1"
          step-strictly
        />
      </ElFormItem>

      <ElFormItem>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">
          确认修改
        </ElButton>
        <ElButton @click="visible = false">
          取消
        </ElButton>
      </ElFormItem>
    </ElForm>
  </ElDialog>
</template>
