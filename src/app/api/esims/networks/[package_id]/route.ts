import dummy_data from "@/assets/data/dummy_country.json";
import { EXCHANGE_RATE, MARGIN_RATE } from "@/constants";
import axios from "axios";

import { ceil } from "@/lib/utils";

export async function GET(
    request: Request,
    { params }: { params: { package_id: string } },
) {
    const package_id = params.package_id;

    const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: process.env.AIRALO_API_URL + "/v2/packages",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${process.env.AIRALO_BUSINESS_ACCESS_TOKEN}`,
        },
        params: {
            limit: 300,
        },
    };

    let response = await axios(config).catch(function (error) {
        console.log(error.response);
    });

    console.log(response?.data.data);

    if (response?.data && response.data.data) {
        // const foundPackage = this.packages.find((pkg) =>
        //     pkg.operators.some((op) =>
        //         op.packages.some((p) => p.id === package_id)
        //     )
        // );

        //find package with package_id
        let p = response.data.data.find((country: any) =>
            country.operators.some((operator: any) =>
                operator.packages.some((p: any) => p.id === package_id),
            ),
        );

        if (p && p.operators && p.operators.length > 0) {
            return Response.json(p.operators[0].coverages);
        }
    }

    return Response.json([]);
}
