import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/db/dbConfig';
import { Notification } from '@/models/models';


export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id : string  }> }
) {
  await connect();

  const { id } = await props.params;

  try {

    const deleteNotification = await Notification.findByIdAndDelete(id);

    if(!deleteNotification){
        return NextResponse.json(
          { message: "There is some error in deleting " },
          { status: 400 }
        );
    }

    console.log(deleteNotification)
    return NextResponse.json(
      { message: "Success" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error : ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
