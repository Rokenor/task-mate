import React, { useEffect, useContext } from 'react';
import Link from 'next/link';
import { 
  Task, 
  useDeleteTaskMutation, 
  useChangeStatusMutation,
  TasksQueryVariables, 
  TasksDocument, 
  TaskStatus, 
  TaskQuery, 
  TaskQueryVariables, 
  TasksQuery
} from '../generated/graphql';
import { TaskFilterContext } from '../pages/[status]';

interface Props {
  task: Task
}

const TaskListItem : React.FC<Props> = ({ task }) => {
  const { status } = useContext(TaskFilterContext);

  const [deleteTask, { loading, error }] = useDeleteTaskMutation({
    update: (cache, result) => {
      const data = cache.readQuery<TasksQuery, TasksQueryVariables>({
        query: TasksDocument,
        variables: { status }
      });

      if (data) {
        cache.writeQuery<TasksQuery, TasksQueryVariables>({
          query: TasksDocument,
          variables: { status },
          data: {
            tasks: data.tasks.filter(({id}) => id !== result.data?.deleteTask.id)
          }
        })
      }
    }
  });
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    deleteTask({
      variables: { id: task.id }
    })
  };

  const [changeStatus, { loading: changingStatus, error: changeStatusError }] = useChangeStatusMutation();

  const handleChangeStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = task.status === TaskStatus.Active ? TaskStatus.Completed : TaskStatus.Active;

    changeStatus({ 
      variables: {
        id: task.id,
        status: newStatus
      }
    });
  }

  useEffect(() => {
    if (error) {
      alert('An error occured.');
    }

    if (changeStatusError) {
      alert('Could not change the task status.');
    }
  }, [error, changeStatusError]);

  return (
    <li className="task-list-item">
      <label className="checkbox">
        <input 
          type="checkbox" 
          onChange={handleChangeStatus} 
          checked={task.status === TaskStatus.Completed} 
          disabled={changingStatus}
        />
        <span className="checkbox-mark">&#10003;</span>
      </label>
      <Link href="/update/[id]" as={`/update/${task.id}`}>
        <a className="task-list-item-title">{task.title}</a>
      </Link>
      <button 
        disabled={loading}
        className="task-list-item-delete" 
        onClick={handleDeleteClick}
      >
        &times;
      </button>
    </li>
  )
}

export default TaskListItem;