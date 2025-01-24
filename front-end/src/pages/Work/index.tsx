import React, { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import { useAuthContext } from '@/contexts/authContext'
import { Task } from '@/interfaces/Task.interface'
import { useSearchParams } from 'react-router-dom'

const Work: React.FC = () => {
  const { authState } = useAuthContext()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Pagination and Filtering State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [tasksPerPage, setTasksPerPage] = useState(10)

  // Filter States
  const [date, setDate] = useState<string>(() => {
    const current = new Date()
    current.setHours(current.getUTCHours() + 7)
    return current.toISOString().split('T')[0]
  })
  const [status, setStatus] = useState<string>('all')
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Derived States
  const showUnchecked = searchParams.get('showUnchecked') === 'true'

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/api/tasks', {
        params: {
          date: date || undefined,
          status: status || undefined,
          showUnchecked: showUnchecked ? 'true' : undefined,
          page: currentPage,
          limit: tasksPerPage
        }
      })

      const { tasks, meta } = response.data
      setTasks(tasks)
      setTotalPages(meta.totalPage)
      setTotalTasks(meta.total)
    } catch (error) {
      console.error('Task fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (authState.isLoggedin) {
      fetchTasks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState, date, status, showUnchecked, currentPage,tasksPerPage])

  const toggleTaskCheck = async (task: Task) => {
    try {
      await api.put(`/api/tasks/${task.task_id}`, {
        ...task,
        is_check: !task.is_check
      })
      setTasks(
        tasks.map(t =>
          t.task_id === task.task_id ? { ...task, is_check: !task.is_check } : t
        )
      )
    } catch (error) {
      console.error('Task update error:', error)
    }
  }

  const updateTask = async (task: Task) => {
    try {
      await api.put(`/api/tasks/${task.task_id}`, task)
      setTasks(tasks.map(t => (t.task_id === task.task_id ? task : t)))
      setEditingTask(null)
    } catch (error) {
      console.error('Task update error:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleEditSubmit = async (e: React.FormEvent, updatedTask: Task) => {
    e.preventDefault()
    await updateTask(updatedTask)
  }

  const handleShowUncheckedChange = (checked: boolean) => {
    setSearchParams({
      showUnchecked: checked ? 'true' : 'false',
      page: currentPage.toString(),
      date,
      status
    })
  }

  const renderPagination = () => (
    <div className='flex justify-between items-center mt-4 px-4'>
      {/* PerPage */}

      <div>
        <select
          value={tasksPerPage}
          onChange={e => {
            setCurrentPage(1)
            setSearchParams({
              showUnchecked: showUnchecked.toString(),
              page: '1',
              limit: e.target.value,
              date,
              status,
              perPage: e.target.value
            })
            setTasksPerPage(Number(e.target.value))
          }}
          className='px-2 py-1 border rounded'
        >
          <option value='10'>10</option>
          <option value='20'>20</option>
          <option value='30'>30</option>
          <option value='40'>40</option>
          <option value='50'>50</option>
        </select>
      </div>
      
      <div className='text-gray-600'>
        {`${(currentPage - 1) * tasksPerPage + 1}-${Math.min(
          currentPage * tasksPerPage,
          totalTasks
        )} of ${totalTasks}`}
      </div>
      <div className='flex space-x-2'>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className='px-4 py-2 bg-gray-200 rounded disabled:opacity-50'
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className='px-4 py-2 bg-gray-200 rounded disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  )

  // UPdate searchParams when currentPage changes
  useEffect(() => {
    setSearchParams({
      showUnchecked: showUnchecked.toString(),
      page: currentPage.toString(),
      date,
      status
    })
  }, [currentPage, date, setSearchParams, showUnchecked, status, tasksPerPage])

  return (
    <div className='container mx-auto p-4'>
      <div className='bg-white shadow-md rounded-lg p-6 mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              วันที่ลงงาน
              <input
                type='date'
                value={date}
                onChange={e => setDate(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200'
              />
            </label>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              สถานะ
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200'
              >
                <option value='all'>ทั้งหมด</option>
                <option value='checked'>ลงแพลนแล้ว</option>
                <option value='unchecked'>ยังไม่ลงแพลน</option>
              </select>
            </label>
          </div>
          <div className='flex items-center mt-6'>
            <label className='inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={showUnchecked}
                onChange={e => handleShowUncheckedChange(e.target.checked)}
                className='sr-only peer'
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className='ml-3 text-sm font-medium text-gray-900'>
                ดูงานที่ยังไม่ลงแพลนทั้งหมด
              </span>
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500'></div>
        </div>
      ) : tasks.length > 0 ? (
        <>
          <div className='bg-white shadow-md rounded-lg overflow-hidden'>
            <table className='w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {[
                    'ลำดับ',
                    'วันที่ทำงาน',
                    'ชื่อ - นามสกุล',
                    'ชื่องาน',
                    'สถานะ',
                    'ประเภท',
                    'ลงแพลน',
                    'จัดการ'
                  ].map(header => (
                    <th
                      key={header}
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {tasks.map((task, index) => (
                  <tr key={task.task_id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {(currentPage - 1) * tasksPerPage + index + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {new Date(task.work_date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {task.User.user_fname} {task.User.user_lname}
                    </td>
                    <td className='px-6 py-4'>
                      {editingTask?.task_id === task.task_id ? (
                        <form
                          onSubmit={e =>
                            handleEditSubmit(e, {
                              ...task,
                              task_name: editingTask.task_name
                            })
                          }
                        >
                          <input
                            type='text'
                            value={editingTask.task_name}
                            onChange={e =>
                              setEditingTask({
                                ...editingTask,
                                task_name: e.target.value
                              })
                            }
                            className='border rounded px-2'
                          />
                          <button
                            type='submit'
                            className='ml-2 bg-green-500 text-white px-3 py-1 rounded'
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        task.task_name
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.is_done
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {task.is_done ? 'เสร็จ' : 'ไม่เสร็จ'}
                      </span>
                    </td>
                    <td className='px-6 py-4'>{task.task_type}</td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => toggleTaskCheck(task)}
                        className={`px-3 py-1 rounded-full text-white text-xs ${
                          task.is_check ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        {task.is_check ? 'ลงแพลน' : 'ยังไม่ลง'}
                      </button>
                    </td>
                    <td className='px-6 py-4'>
                      {editingTask?.task_id === task.task_id ? null : (
                        <button
                          onClick={() => handleEditTask(task)}
                          className='text-blue-500 hover:text-blue-700'
                        >
                          แก้ไข
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className='text-center py-10 bg-white rounded-lg shadow-md'>
          <p className='text-gray-600'>ไม่พบงานในวันที่ระบุ</p>
        </div>
      )}
    </div>
  )
}

export default Work
