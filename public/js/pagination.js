export function calculatePagination(totalPages, currentPage) {
    const pagination = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pagination.push({page: i, isActive: i === currentPage + 1});
        }
    } else {
        if (currentPage <= 2) {
            for (let i = 1; i <= 4; i++) {
                pagination.push({page: i, isActive: i === currentPage + 1});
            }
            pagination.push({isEllipsis: true});
            pagination.push({page: totalPages, isActive: false});
        } else if (currentPage >= totalPages - 3) {
            pagination.push({page: 1, isActive: false});
            pagination.push({isEllipsis: true});
            for (let i = totalPages - 3; i <= totalPages; i++) {
                pagination.push({page: i, isActive: i === currentPage + 1});
            }
        } else {
            pagination.push({page: 1, isActive: false});
            pagination.push({isEllipsis: true});
            for (let i = currentPage; i <= currentPage + 2; i++) {
                pagination.push({page: i, isActive: i === currentPage + 1});
            }
            pagination.push({isEllipsis: true});
            pagination.push({page: totalPages, isActive: false});
        }
    }
    return pagination;
}
