// 二进制流文件下载
getMultiTypeBatchExport(this.formQc).then((res) => {
    const blob = new Blob([res.data])
    // 文件名解码
    const fileName = decodeURI(
        res.headers['content-disposition'].split(" ")[1]
    )
    if ('download' in document.createElement('a')) {
        // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL对象
        document.body.removeChild(elink)
    } else {
        // IE10+下载
        navigator.msSaveBlob(blob, fileName)
    }
    this.$message.success('下载成功')
    this.dialogVisibleQc = false
})

export const getMultiTypeBatchExport = (params) => {
    return request({
        url: '/api/borche-snms-service/productdetailequ/multiTypeBatchExport',
        method: 'get',
        params: {
            ...params
        },
        responseType: 'blob'
    })
}