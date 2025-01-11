import { api } from "../common/api";

const SMSLog = (smsLog) => {

  const handleResend = () => {
    console.log(smsLog.smsLog.id)
    const res = api.post(`logs/smsLogs/${smsLog.smsLog.id}/resend/`)

    console.log("resend res: ", res)
  }

  return (
    <ol className="list-decimal pl-5 space-y-2">
      <li className={`${smsLog.smsLog.status ? "bg-green-300" : "bg-red-300"} flex justify-between shadow-md rounded-lg p-4`}>
        <p className="text-sm font-semibold">شماره تلفن: {smsLog.smsLog.phone_number}</p>
        <button onClick={handleResend}>resend</button>
      </li>
    </ol>
  )
}

export default SMSLog;
