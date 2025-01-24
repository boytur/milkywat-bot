import { useAuthContext } from "@/contexts/authContext";
import { usePageSetting } from "@/contexts/pageSettingContext";
import React, { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import { Task } from "@/interfaces/Task.interface";
import { User } from "@/interfaces/User.interface";
import { api } from "@/utils/api";
import { formatUTCtoThai } from "@/utils";

const MemberDetail: React.FC = () => {
  const { setTitle } = usePageSetting();
  const { authState } = useAuthContext();
  const { discordId } = useParams<{ discordId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User>();
  /**
   * @PSBLaLaHey
   * Function to fetch member detail
   * @returns {Promise<void>}
   * @async
   * @description fetch member detail from discordId
   */

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchMemberDetail = async () => {
    try {
      const response = await api.get(`/api/tasks/${discordId}`);
      setTasks(response.data.tasks.tasks);
      setUser(response.data.tasks.user);
      // Write your code here to fetch member detail using discordId
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error("Error fetching member detail:", error);
    }
  };

  useEffect(() => {
    if (!authState.isLoggedin) {
      return;
    }
    fetchMemberDetail();
    setTitle(`รายละเอียดงานของ ${user?.user_fname} ${user?.user_lname}`);
  }, [authState.isLoggedin, discordId, fetchMemberDetail, setTitle, user?.user_fname, user?.user_lname]);
  useEffect(() => {
    if (user) {
      setTitle(`รายละเอียดงานของ ${user.user_fname} ${user.user_lname}`);
    }
  }, [user, setTitle]);
  return (
    <div
      className="overflow-hidden"
      style={{ height: "calc(100vh - 5rem)", overflowY: "scroll" }}
    >
      {user && user.discord_id !== null && (
        <>
          <div className="flex justify-center m-2 bg-white border rounded-md ">
            <div className="flex flex-col items-center w-full h-full border">
              <div className="rounded-full border border-black object-cover w-[10rem] h-[10rem] flex justify-center overflow-hidden">
                <img
                  className="object-cover w-full h-full"
                  src={`${user.avatar}`}
                  alt=""
                />
              </div>
              <p className="mt-3 mb-2 text-lg font-bold ">
                {user?.user_fname} {user.user_lname}
              </p>
            </div>
          </div>
          <div className="m-2 bg-white border rounded-md">
            <div className="w-full border">
              <h1 className="text-xl font-semibold pb-4 m-1 pl-3 mt-3 border-b-[1px]">ตารางงานที่ทำ</h1>
              <div className="-m-1.5">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div>
                    <table className="w-full">
                      <thead className="table-thead">
                        <tr>
                          <th scope="col" className="table-th">ชื่องาน</th>
                          <th scope="col" className="table-th">ประเภท</th>
                          <th scope="col" className="table-th">เสร็จ</th>
                          <th scope="col" className="table-th">ลงแพลน</th>
                          <th scope="col" className="table-th">วันที่ทำงาน</th>
                          <th scope="col" className="table-th">วันที่ลงงาน</th>
                        </tr>
                      </thead>
                      <tbody className="table-tbody">
                        {tasks.map(task => (
                          <tr key={task.task_id} className="table-tr">
                            <td className="table-td">{task.task_name}</td>
                            <td className="table-td">{task.task_type}</td>
                            <td className="table-td">{task.is_done? "เสร็จ" : "ไม่เสร็จ"}</td>
                            <td className="table-td">{task.is_check? "ลงแพลน" : "ยังไม่ลงแพลน"}</td>
                            <td className="table-td">{formatUTCtoThai(task.work_date)}</td>
                            <td className="table-td">{formatUTCtoThai(task.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberDetail;
